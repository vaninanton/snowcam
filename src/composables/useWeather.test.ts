import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCache,
  readCache,
  useWeather,
  WEATHER_CACHE_KEY,
  WEATHER_CACHE_TTL_MS,
  HOURLY_STRIP_HOURS,
} from "./useWeather";
import type { TimelinesResponse } from "@/types/tomorrow";

function makeResponse(temperature = 5): TimelinesResponse {
  // Времена задаются относительно «сейчас»: окно запроса охватывает и прошлое,
  // и будущее, а useWeather раскладывает часы по обе стороны от текущего момента
  const hour = (offset: number) =>
    new Date(Date.now() + offset * 3600_000).toISOString();

  return {
    data: {
      timelines: [
        {
          timestep: "current",
          intervals: [{ startTime: hour(0), values: { temperature } }],
        },
        {
          timestep: "1h",
          intervals: [
            { startTime: hour(-2), values: { snowAccumulation: 10 } },
            { startTime: hour(-1), values: { snowAccumulation: 20 } },
            { startTime: hour(1), values: {} },
            { startTime: hour(2), values: {} },
          ],
        },
        {
          timestep: "1d",
          intervals: [{ startTime: hour(-6), values: {} }],
        },
      ],
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv("VITE_TOMORROW_API_KEY", "TEST_KEY");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("кэш", () => {
  it("отдаёт свежие данные, не трогая сеть", async () => {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ data: makeResponse(7), timestamp: Date.now() }),
    );
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { current, load } = useWeather();
    await load();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(current.value?.values.temperature).toBe(7);
  });

  it("выбрасывает просроченный кэш и идёт в сеть", async () => {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({
        data: makeResponse(7),
        timestamp: Date.now() - WEATHER_CACHE_TTL_MS - 1,
      }),
    );
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json(makeResponse(3)));

    const { current, load } = useWeather();
    await load();

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(current.value?.values.temperature).toBe(3);
  });

  it("переживает битый JSON и чистит его", () => {
    localStorage.setItem(WEATHER_CACHE_KEY, "{не json");

    expect(readCache()).toBeNull();
    expect(localStorage.getItem(WEATHER_CACHE_KEY)).toBeNull();
  });

  it("не принимает payload без timelines", () => {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ data: { data: {} }, timestamp: Date.now() }),
    );

    expect(readCache()).toBeNull();
  });

  it("clearCache удаляет запись", () => {
    localStorage.setItem(WEATHER_CACHE_KEY, "что-нибудь");
    clearCache();

    expect(localStorage.getItem(WEATHER_CACHE_KEY)).toBeNull();
  });
});

describe("загрузка", () => {
  it("раскладывает ответ по timestep и сохраняет кэш", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(makeResponse()),
    );

    const { current, daily, isLoading, error, load } = useWeather();
    await load();

    expect(current.value?.values.temperature).toBe(5);
    expect(daily.value).toHaveLength(1);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(localStorage.getItem(WEATHER_CACHE_KEY)).not.toBeNull();
  });

  it("разделяет часы на прошедшие и будущие", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(makeResponse()),
    );

    const { hourly, pastHourly, load } = useWeather();
    await load();

    // Прошлое нужно для свежего снега, но в полосе прогноза ему не место
    expect(pastHourly.value).toHaveLength(2);
    expect(hourly.value).toHaveLength(2);
    expect(
      pastHourly.value.every((i) => new Date(i.startTime) < new Date()),
    ).toBe(true);
    expect(hourly.value.every((i) => new Date(i.startTime) >= new Date())).toBe(
      true,
    );
  });

  it("обрезает полосу прогноза, чтобы она не растянулась на пять суток", async () => {
    const many = makeResponse();
    many.data.timelines[1]!.intervals = Array.from({ length: 120 }, (_, i) => ({
      startTime: new Date(Date.now() + (i + 1) * 3600_000).toISOString(),
      values: {},
    }));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(many));

    const { hourly, load } = useWeather();
    await load();

    expect(hourly.value).toHaveLength(HOURLY_STRIP_HOURS);
  });

  it("не роняет приложение на ошибке HTTP и не кэширует её", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 503 }),
    );

    const { error, isLoading, current, load } = useWeather();
    await load();

    expect(error.value).toBeInstanceOf(Error);
    expect(error.value?.message).toContain("503");
    expect(current.value).toBeNull();
    expect(isLoading.value).toBe(false);
    expect(localStorage.getItem(WEATHER_CACHE_KEY)).toBeNull();
  });

  it("не роняет приложение при обрыве сети", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const { error, load } = useWeather();
    await load();

    expect(error.value?.message).toBe("network down");
  });

  it("сообщает об отсутствующем ключе, не делая запроса", async () => {
    vi.stubEnv("VITE_TOMORROW_API_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { error, load } = useWeather();
    await load();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(error.value?.message).toContain("VITE_TOMORROW_API_KEY");
  });
});
