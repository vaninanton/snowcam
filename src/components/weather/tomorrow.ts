import dayjs from "./dayjs";

export const TOMORROW_TIMELINE_URL = "https://api.tomorrow.io/v4/timelines";
export const TOMORROW_LOCATION = [43.120649, 77.096193] as const;
export const TOMORROW_TIMEZONE = "Asia/Almaty";

/**
 * Часов назад в окне запроса. Бесплатный план дальше не пускает:
 * на -48ч приходит 403 «startTime cannot be more than 24 hours in the past».
 * Именно поэтому «свежий снег» считается за сутки, а не за календарное вчера.
 */
export const HISTORY_HOURS = 24;

/** Дней вперёд. Суточных интервалов приходит на один больше — за вчера. */
export const FORECAST_DAYS = 5;

/**
 * Мгновенные поля: приходят во всех timestep.
 * Расшифровки — из документации Tomorrow.io, это единственное описание
 * полей в проекте.
 *
 * Сознательно не запрашиваются:
 *   snowDepth          — geographic-limited регионом США, для Шымбулака
 *                        всегда null (и именно это давало «Снег 0 см»)
 *   *AccumulationLwe   — API их не возвращает вовсе
 */
const INSTANT_FIELDS = {
  temperature: 'The "real" temperature measurement (at 2m)',
  temperatureApparent:
    "The temperature equivalent perceived by humans, caused by the combined effects of air temperature, relative humidity, and wind speed (at 2m)",
  dewPoint:
    "The temperature to which air must be cooled to become saturated with water vapor (at 2m)",
  humidity: "The concentration of water vapor present in the air",
  windSpeed:
    "The fundamental atmospheric quantity caused by air moving from high to low pressure, usually due to changes in temperature (at 10m)",
  windDirection:
    "The direction from which it originates, measured in degrees clockwise from due north (at 10m)",
  windGust:
    "The maximum brief increase in the speed of the wind, usually less than 20 seconds (at 10m)",
  pressureSurfaceLevel:
    "The force exerted against a surface by the weight of the air above the surface (at the surface level)",
  precipitationProbability:
    "Probability of precipitation occurring within the time period, percentage 0–100",
  precipitationType:
    "Type of precipitation: 0 none, 1 rain, 2 snow, 3 freezing rain, 4 ice pellets",
  rainIntensity:
    "Instantaneous rate of liquid precipitation (rain) at ground level, mm/hr",
  rainAccumulation:
    "Accumulated liquid precipitation (rain) over the time period, mm",
  snowIntensity: "Instantaneous rate of snowfall at ground level, mm/hr",
  snowAccumulation:
    "Accumulated snowfall over the time period, MILLIMETRES (not cm)",
  freezingRainIntensity:
    "Instantaneous rate of freezing rain (rain that freezes on contact with surfaces), mm/hr",
  sleetIntensity:
    "Instantaneous rate of sleet or ice pellets (frozen raindrops) at ground level, mm/hr",
  iceAccumulation:
    "Accumulated ice (e.g. from freezing rain) over the time period, mm",
  visibility:
    "Horizontal distance at which objects can be clearly identified, km (reduced by fog, precipitation)",
  cloudCover: "Fraction of sky covered by clouds (0–1)",
  cloudBase: "Height of the lowest cloud base above ground level, km or null",
  uvIndex:
    "UV index (0–11+), measure of intensity of UV radiation at the surface",
  weatherCode:
    "Numeric weather condition code (basic conditions only); see Tomorrow.io weather codes",
  sunriseTime: "ISO 8601 time of sunrise for the location",
  sunsetTime: "ISO 8601 time of sunset for the location",
} satisfies Record<string, string>;

/**
 * Суточные агрегаты. Осмысленны только в timestep "1d" — в остальных API
 * их тоже возвращает, но брать оттуда нечего.
 */
const DAILY_FIELDS = {
  temperatureMin: "Lowest temperature of the day",
  temperatureMax: "Highest temperature of the day",
  snowAccumulationSum: "Total snowfall over the day, MILLIMETRES (not cm)",
  windGustMax: "Strongest wind gust of the day",
  uvIndexMax: "Highest UV index of the day",
  precipitationProbabilityMax: "Highest precipitation probability of the day",
} satisfies Record<string, string>;

export const TIMESTEPS = ["current", "1h", "1d"] as const;

/**
 * Собирает URL запроса на окно «сутки назад … +5 дней». Прошлое нужно для
 * свежего снега, будущее — для прогноза; всё это один запрос, поэтому лимит
 * не меняется.
 */
export function buildTimelineUrl(apiKey: string, now = dayjs()): string {
  const fields = [
    ...Object.keys(INSTANT_FIELDS),
    ...Object.keys(DAILY_FIELDS),
  ].join(",");

  // Списочные параметры API ждёт через запятую — URLSearchParams массивы
  // сам так не сериализует, поэтому склеиваем их вручную
  const params = new URLSearchParams({
    apikey: apiKey,
    location: TOMORROW_LOCATION.join(","),
    fields,
    units: "metric",
    timesteps: TIMESTEPS.join(","),
    // toISOString() всегда отдаёт UTC, отдельный перевод во UTC не нужен
    startTime: now.subtract(HISTORY_HOURS, "hour").toISOString(),
    endTime: now.add(FORECAST_DAYS, "day").toISOString(),
    timezone: TOMORROW_TIMEZONE,
  });

  return `${TOMORROW_TIMELINE_URL}?${params}`;
}
