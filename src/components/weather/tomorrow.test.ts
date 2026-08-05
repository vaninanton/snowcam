import { describe, expect, it } from "vitest";
import dayjs from "./dayjs";
import {
  buildTimelineUrl,
  TOMORROW_LOCATION,
  TOMORROW_TIMELINE_URL,
  TOMORROW_TIMEZONE,
} from "./tomorrow";

const NOW = dayjs("2026-08-05T13:45:47.000Z");

describe("buildTimelineUrl", () => {
  it("собирает окно «сутки назад … +5 дней» в UTC", () => {
    const params = new URL(buildTimelineUrl("KEY", NOW)).searchParams;

    // Прошлое нужно для свежего снега. Дальше суток бесплатный план не пускает
    expect(params.get("startTime")).toBe("2026-08-04T13:45:47.000Z");
    expect(params.get("endTime")).toBe("2026-08-10T13:45:47.000Z");
  });

  it("не запрашивает поля, которых API не отдаёт для этой точки", () => {
    const fields = new URL(buildTimelineUrl("KEY", NOW)).searchParams.get(
      "fields",
    );

    // snowDepth ограничен регионом США, *Lwe не возвращаются вовсе
    expect(fields).not.toContain("snowDepth");
    expect(fields).not.toContain("Lwe");
  });

  it("запрашивает суточные агрегаты для условий катания", () => {
    const fields = new URL(buildTimelineUrl("KEY", NOW)).searchParams
      .get("fields")
      ?.split(",");

    expect(fields).toEqual(
      expect.arrayContaining([
        "snowAccumulationSum",
        "temperatureMin",
        "temperatureMax",
        "windGustMax",
        "uvIndexMax",
      ]),
    );
  });

  it("склеивает списочные параметры через запятую", () => {
    const params = new URL(buildTimelineUrl("KEY", NOW)).searchParams;

    expect(params.get("location")).toBe(TOMORROW_LOCATION.join(","));
    expect(params.get("timesteps")).toBe("current,1h,1d");
    expect(params.get("fields")?.split(",").length).toBeGreaterThan(20);
    expect(params.get("fields")).toContain("temperature");
    expect(params.get("fields")).toContain("sunsetTime");
  });

  it("проставляет ключ, единицы и таймзону", () => {
    const params = new URL(buildTimelineUrl("SECRET", NOW)).searchParams;

    expect(params.get("apikey")).toBe("SECRET");
    expect(params.get("units")).toBe("metric");
    expect(params.get("timezone")).toBe(TOMORROW_TIMEZONE);
  });

  it("бьёт в нужный эндпоинт", () => {
    expect(buildTimelineUrl("KEY", NOW).startsWith(TOMORROW_TIMELINE_URL)).toBe(
      true,
    );
  });
});
