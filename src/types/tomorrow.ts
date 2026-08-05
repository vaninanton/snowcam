/** Типы ответа Tomorrow.io v4 /timelines. */

/**
 * Значения одного интервала. Все поля опциональны: набор зависит от timestep
 * (например, sunriseTime приходит только в суточном) и от того, что API
 * посчитал доступным для точки.
 */
export interface WeatherValues {
  temperature?: number;
  temperatureApparent?: number;
  dewPoint?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  windGust?: number;
  pressureSurfaceLevel?: number;
  pressureSeaLevel?: number;
  precipitationProbability?: number;
  precipitationType?: number;
  rainAccumulation?: number;
  snowAccumulation?: number;
  snowDepth?: number;
  sleetAccumulation?: number;
  iceAccumulation?: number;
  visibility?: number;
  cloudCover?: number;
  cloudBase?: number;
  cloudCeiling?: number;
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
