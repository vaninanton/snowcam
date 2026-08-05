import dayjs from "./dayjs";
import type { TimelineInterval } from "@/types/tomorrow";

/** Tomorrow.io отдаёт осадки в мм, кататься же меряют сантиметрами. */
const MM_PER_CM = 10;

/** Ниже этого порога канатки на Шымбулаке обычно встают. */
export const WIND_GUST_ALERT_MS = 15;

/** Видимость ниже километра — «молоко», ехать вслепую. */
export const LOW_VISIBILITY_KM = 1;

/** На сколько дней вперёд суммируем ожидаемый снег. */
export const SNOW_FORECAST_DAYS = 3;

/** Коды типа осадков Tomorrow.io. */
export const PRECIPITATION_TYPE = {
  none: 0,
  rain: 1,
  snow: 2,
  freezingRain: 3,
  icePellets: 4,
} as const;

export interface SkiConditions {
  /** Свежий снег за прошедшие сутки, см. null — нечего показывать. */
  freshSnowCm: number | null;
  /** Ожидаемый снег на ближайшие дни, см. */
  expectedSnowCm: number | null;
  /** Снег идёт прямо сейчас. */
  isSnowingNow: boolean;
  /** Дождь при плюсовой температуре — портит покрытие. */
  isRainOnSnow: boolean;
  /** Максимальный порыв за сегодня, м/с. */
  windGustMaxMs: number | null;
  /** Порывы такие, что подъёмники могут не работать. */
  isWindAlert: boolean;
  /** Видимость ниже порога. */
  isLowVisibility: boolean;
  /** Ночной минимум и дневной максимум за сегодня. */
  tempMin: number | null;
  tempMax: number | null;
  /** Ночью подмораживает, днём тает: утром наст, днём каша. */
  isFreezeThaw: boolean;
  /** Максимальный УФ за сегодня. */
  uvIndexMax: number | null;
  /** Есть ли вообще зимний контекст — по данным, а не по календарю. */
  isWinter: boolean;
}

function nullable(value: number | null | undefined): number | null {
  return value == null ? null : value;
}

function mmToCm(mm: number): number {
  return Math.round(mm / MM_PER_CM);
}

/** Суммирует поле по интервалам, игнорируя пропуски. */
function sumField(
  intervals: readonly TimelineInterval[],
  field: "snowAccumulation" | "snowAccumulationSum",
): number {
  return intervals.reduce(
    (total, interval) => total + (interval.values[field] ?? 0),
    0,
  );
}

/** Суточный интервал, попадающий на сегодня. */
export function findToday(
  daily: readonly TimelineInterval[],
  now = dayjs(),
): TimelineInterval | null {
  return (
    daily.find((interval) => dayjs(interval.startTime).isSame(now, "day")) ??
    null
  );
}

/**
 * Считает показатели для катания. Все «нулевые» величины схлопываются в null:
 * виджет не должен показывать «Снег 0 см» там, где снега просто нет.
 */
export function deriveConditions(
  current: TimelineInterval | null,
  pastHourly: readonly TimelineInterval[],
  daily: readonly TimelineInterval[],
  now = dayjs(),
): SkiConditions {
  const values = current?.values ?? {};
  const today = findToday(daily, now);

  const freshSnowRaw = mmToCm(sumField(pastHourly, "snowAccumulation"));
  // Считаем от начала суток, а не от текущего часа: иначе интервал,
  // отстоящий на 3 календарных дня, даёт diff в 2 дня и попадает в окно
  const todayStart = now.startOf("day");
  const upcoming = daily.filter((interval) => {
    const dayIndex = dayjs(interval.startTime)
      .startOf("day")
      .diff(todayStart, "day");
    return dayIndex >= 0 && dayIndex < SNOW_FORECAST_DAYS;
  });
  const expectedSnowRaw = mmToCm(sumField(upcoming, "snowAccumulationSum"));

  const tempMin = nullable(today?.values.temperatureMin);
  const tempMax = nullable(today?.values.temperatureMax);
  const windGustMaxMs = nullable(today?.values.windGustMax);
  const visibility = nullable(values.visibility);
  const temperature = nullable(values.temperature);

  // Зима определяется по данным, а не по календарю: в горах снег бывает и летом
  const isWinter =
    freshSnowRaw > 0 ||
    expectedSnowRaw > 0 ||
    (tempMax !== null && tempMax < 5) ||
    (values.snowIntensity ?? 0) > 0;

  return {
    freshSnowCm: freshSnowRaw > 0 ? freshSnowRaw : null,
    expectedSnowCm: expectedSnowRaw > 0 ? expectedSnowRaw : null,
    isSnowingNow: (values.snowIntensity ?? 0) > 0,
    isRainOnSnow:
      isWinter &&
      values.precipitationType === PRECIPITATION_TYPE.rain &&
      (values.rainIntensity ?? 0) > 0 &&
      temperature !== null &&
      temperature > 0,
    windGustMaxMs,
    isWindAlert: windGustMaxMs !== null && windGustMaxMs >= WIND_GUST_ALERT_MS,
    isLowVisibility: visibility !== null && visibility < LOW_VISIBILITY_KM,
    tempMin,
    tempMax,
    isFreezeThaw:
      tempMin !== null && tempMax !== null && tempMin < 0 && tempMax > 0,
    uvIndexMax: nullable(today?.values.uvIndexMax),
    isWinter,
  };
}
