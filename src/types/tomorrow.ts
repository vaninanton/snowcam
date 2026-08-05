/** Типы ответа Tomorrow.io v4 /timelines. */

/**
 * Значения одного интервала. Все поля опциональны: набор зависит от timestep
 * (например, sunriseTime приходит только в суточном) и от того, что API
 * посчитал доступным для точки.
 */
export interface WeatherValues {
  temperature?: number;
  temperatureApparent?: number;
  /** Суточные агрегаты — приходят только в timestep "1d". */
  temperatureMin?: number | null;
  temperatureMax?: number | null;
  snowAccumulationSum?: number | null;
  windGustMax?: number | null;
  uvIndexMax?: number | null;
  precipitationProbabilityMax?: number | null;
  dewPoint?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  windGust?: number;
  pressureSurfaceLevel?: number;
  pressureSeaLevel?: number;
  precipitationProbability?: number;
  /** См. PRECIPITATION_TYPE в conditions.ts. */
  precipitationType?: number;
  rainAccumulation?: number;
  rainIntensity?: number;
  /** Миллиметры, не сантиметры. */
  snowAccumulation?: number;
  /** мм/ч. */
  snowIntensity?: number;
  sleetAccumulation?: number;
  iceAccumulation?: number;
  /** Километры. Может быть null. */
  visibility?: number | null;
  cloudCover?: number;
  cloudBase?: number | null;
  cloudCeiling?: number | null;
  moonPhase?: number;
  uvIndex?: number;
  uvHealthConcern?: number;
  evapotranspiration?: number;
  weatherCode?: number;
  weatherCodeDay?: number;
  weatherCodeNight?: number;
  weatherCodeFullDay?: number;
  /** ISO 8601. */
  sunriseTime?: string;
  /** ISO 8601. */
  sunsetTime?: string;
}

export interface TimelineInterval {
  /** ISO 8601 с offset таймзоны запроса. */
  startTime: string;
  values: WeatherValues;
}

export type Timestep = "current" | "1h" | "1d";

export interface Timeline {
  timestep: Timestep;
  intervals: TimelineInterval[];
}

export interface TimelinesResponse {
  data: {
    timelines: Timeline[];
  };
}
