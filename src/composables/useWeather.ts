import { readonly, ref, shallowRef } from "vue";
import dayjs from "@/components/weather/dayjs";
import { buildTimelineUrl } from "@/components/weather/tomorrow";
import type {
  TimelineInterval,
  TimelinesResponse,
  Timestep,
} from "@/types/tomorrow";

/** Ключ сохранён с прежней версии, чтобы не осиротить кэш у пользователей. */
export const WEATHER_CACHE_KEY = "tomorrowioData";
export const WEATHER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface CachedPayload {
  data: TimelinesResponse;
  timestamp: number;
}

function isFreshPayload(value: unknown): value is CachedPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Partial<CachedPayload>;
  if (typeof payload.timestamp !== "number") return false;
  if (!Array.isArray(payload.data?.data?.timelines)) return false;
  return Date.now() - payload.timestamp < WEATHER_CACHE_TTL_MS;
}

/** Возвращает годный кэш либо null, попутно вычищая просроченный и битый. */
export function readCache(): TimelinesResponse | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(WEATHER_CACHE_KEY);
  } catch {
    // localStorage недоступен (приватный режим) — работаем без кэша
    return null;
  }
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isFreshPayload(parsed)) return parsed.data;
  } catch {
    // битый JSON — удаляем ниже вместе с просроченным
  }

  clearCache();
  return null;
}

export function writeCache(data: TimelinesResponse): void {
  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() } satisfies CachedPayload),
    );
  } catch {
    // квота или приватный режим — кэш не обязателен
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(WEATHER_CACHE_KEY);
  } catch {
    // нечего чистить
  }
}

function pickTimeline(
  response: TimelinesResponse,
  timestep: Timestep,
): TimelineInterval[] {
  return (
    response.data.timelines.find((timeline) => timeline.timestep === timestep)
      ?.intervals ?? []
  );
}

/**
 * Погода с кэшем на 6 часов. У Tomorrow.io ограниченный бесплатный лимит,
 * поэтому запрос уходит только когда кэш просрочен.
 */
/** Сколько часов прогноза показывать в полосе. Запрос охватывает 5 суток. */
export const HOURLY_STRIP_HOURS = 24;

export function useWeather() {
  const isLoading = ref(false);
  const error = shallowRef<Error | null>(null);
  const current = shallowRef<TimelineInterval | null>(null);
  const hourly = shallowRef<readonly TimelineInterval[]>([]);
  const pastHourly = shallowRef<readonly TimelineInterval[]>([]);
  const daily = shallowRef<readonly TimelineInterval[]>([]);

  function apply(response: TimelinesResponse): void {
    const now = dayjs();
    const allHourly = pickTimeline(response, "1h");

    current.value = pickTimeline(response, "current")[0] ?? null;
    // Окно запроса начинается сутки назад: прошлые часы нужны для свежего
    // снега, но в полосе прогноза им делать нечего
    pastHourly.value = allHourly.filter((interval) =>
      dayjs(interval.startTime).isBefore(now),
    );
    hourly.value = allHourly
      .filter((interval) => !dayjs(interval.startTime).isBefore(now))
      .slice(0, HOURLY_STRIP_HOURS);
    daily.value = pickTimeline(response, "1d");
  }

  async function load(): Promise<void> {
    const cached = readCache();
    if (cached) {
      apply(cached);
      return;
    }

    const apiKey = import.meta.env.VITE_TOMORROW_API_KEY;
    if (!apiKey) {
      error.value = new Error("Не задан VITE_TOMORROW_API_KEY");
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(buildTimelineUrl(apiKey));
      if (!response.ok) {
        throw new Error(`Tomorrow.io ответил ${response.status}`);
      }
      const data = (await response.json()) as TimelinesResponse;
      apply(data);
      writeCache(data);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause));
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    current: readonly(current),
    hourly: readonly(hourly),
    pastHourly: readonly(pastHourly),
    daily: readonly(daily),
    load,
  };
}
