import { useEffect, useState } from "react";
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

/** Сколько часов прогноза показывать в полосе. Запрос охватывает 5 суток. */
export const HOURLY_STRIP_HOURS = 24;

export interface WeatherData {
  current: TimelineInterval | null;
  /** Прогноз начиная с текущего часа, не длиннее HOURLY_STRIP_HOURS. */
  hourly: readonly TimelineInterval[];
  /** Прошедшие часы: нужны для свежего снега, в полосе прогноза не показываются. */
  pastHourly: readonly TimelineInterval[];
  daily: readonly TimelineInterval[];
}

export type WeatherState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; data: WeatherData };

export function splitTimelines(response: TimelinesResponse): WeatherData {
  const now = dayjs();
  const allHourly = pickTimeline(response, "1h");

  return {
    current: pickTimeline(response, "current")[0] ?? null,
    // Окно запроса начинается сутки назад: прошлые часы нужны для свежего
    // снега, но в полосе прогноза им делать нечего
    pastHourly: allHourly.filter((interval) =>
      dayjs(interval.startTime).isBefore(now),
    ),
    hourly: allHourly
      .filter((interval) => !dayjs(interval.startTime).isBefore(now))
      .slice(0, HOURLY_STRIP_HOURS),
    daily: pickTimeline(response, "1d"),
  };
}

async function fetchWeather(): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_TOMORROW_API_KEY;
  if (!apiKey) throw new Error("Не задан VITE_TOMORROW_API_KEY");

  const response = await fetch(buildTimelineUrl(apiKey));
  if (!response.ok) {
    throw new Error(`Tomorrow.io ответил ${response.status}`);
  }
  const data = (await response.json()) as TimelinesResponse;
  writeCache(data);
  return splitTimelines(data);
}

let inflight: Promise<WeatherData> | null = null;

/**
 * Погода с кэшем на 6 часов. У Tomorrow.io ограниченный бесплатный лимит,
 * поэтому запрос уходит только когда кэш просрочен, а одновременные вызовы
 * получают один и тот же запрос — StrictMode в dev запускает эффекты дважды.
 */
export function loadWeather(): Promise<WeatherData> {
  const cached = readCache();
  if (cached) return Promise.resolve(splitTimelines(cached));

  inflight ??= fetchWeather().finally(() => {
    inflight = null;
  });
  return inflight;
}

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

/** Свежий кэш отдаётся сразу при первом рендере, без мигания «Загрузки». */
function initialState(): WeatherState {
  const cached = readCache();
  return cached
    ? { status: "ready", data: splitTimelines(cached) }
    : { status: "loading" };
}

export function useWeather(): WeatherState {
  const [state, setState] = useState(initialState);
  const needsFetch = state.status === "loading";

  useEffect(() => {
    if (!needsFetch) return;

    let cancelled = false;
    loadWeather().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (cause: unknown) => {
        if (!cancelled) setState({ status: "error", error: toError(cause) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [needsFetch]);

  return state;
}
