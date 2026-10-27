import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  clearCache,
  loadWeather,
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

    const { current } = await loadWeather();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(current?.values.temperature).toBe(7);
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

    const { current } = await loadWeather();

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(current?.values.temperature).toBe(3);
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

    const { current, daily } = await loadWeather();

    expect(current?.values.temperature).toBe(5);
    expect(daily).toHaveLength(1);
    expect(localStorage.getItem(WEATHER_CACHE_KEY)).not.toBeNull();
  });

  it("разделяет часы на прошедшие и будущие", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(makeResponse()),
    );

    const { hourly, pastHourly } = await loadWeather();

    // Прошлое нужно для свежего снега, но в полосе прогноза ему не место
    expect(pastHourly).toHaveLength(2);
    expect(hourly).toHaveLength(2);
    expect(pastHourly.every((i) => new Date(i.startTime) < new Date())).toBe(
      true,
    );
    expect(hourly.every((i) => new Date(i.startTime) >= new Date())).toBe(true);
  });

  it("обрезает полосу прогноза, чтобы она не растянулась на пять суток", async () => {
    const many = makeResponse();
    many.data.timelines[1]!.intervals = Array.from({ length: 120 }, (_, i) => ({
      startTime: new Date(Date.now() + (i + 1) * 3600_000).toISOString(),
      values: {},
    }));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(many));

    const { hourly } = await loadWeather();

    expect(hourly).toHaveLength(HOURLY_STRIP_HOURS);
  });

  // StrictMode в dev запускает эффект дважды, а лимит API жёсткий
  it("одновременные вызовы делят один запрос", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json(makeResponse()));

    await Promise.all([loadWeather(), loadWeather()]);

    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("на ошибке HTTP отклоняется и не кэширует её", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 503 }),
    );

    await expect(loadWeather()).rejects.toThrow("503");
    expect(localStorage.getItem(WEATHER_CACHE_KEY)).toBeNull();
  });

  it("после ошибки следующий вызов идёт в сеть заново", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue(Response.json(makeResponse()));

    await expect(loadWeather()).rejects.toThrow("network down");
    await expect(loadWeather()).resolves.toBeDefined();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("сообщает об отсутствующем ключе, не делая запроса", async () => {
    vi.stubEnv("VITE_TOMORROW_API_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(loadWeather()).rejects.toThrow("VITE_TOMORROW_API_KEY");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("useWeather", () => {
  it("со свежим кэшем готов с первого рендера", () => {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ data: makeResponse(7), timestamp: Date.now() }),
    );

    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe("ready");
  });

  it("без кэша загружает погоду", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(makeResponse(3)),
    );

    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });

  it("не роняет приложение при обрыве сети", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useWeather());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(
      result.current.status === "error" && result.current.error.message,
    ).toBe("network down");
  });
});
