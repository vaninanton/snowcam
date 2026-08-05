import ClearDay from "@bybas/weather-icons/design/fill/animation-ready/clear-day.svg";
import ClearNight from "@bybas/weather-icons/design/fill/animation-ready/clear-night.svg";
import Cloudy from "@bybas/weather-icons/design/fill/animation-ready/cloudy.svg";
import Drizzle from "@bybas/weather-icons/design/fill/animation-ready/drizzle.svg";
import FogDay from "@bybas/weather-icons/design/fill/animation-ready/fog-day.svg";
import FogNight from "@bybas/weather-icons/design/fill/animation-ready/fog-night.svg";
import OvercastDay from "@bybas/weather-icons/design/fill/animation-ready/overcast-day.svg";
import OvercastNight from "@bybas/weather-icons/design/fill/animation-ready/overcast-night.svg";
import PartlyCloudyDay from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-day.svg";
import PartlyCloudyDayRain from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-day-rain.svg";
import PartlyCloudyDaySleet from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-day-sleet.svg";
import PartlyCloudyNight from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-night.svg";
import PartlyCloudyNightRain from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-night-rain.svg";
import PartlyCloudyNightSleet from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-night-sleet.svg";
import Rain from "@bybas/weather-icons/design/fill/animation-ready/rain.svg";
import Sleet from "@bybas/weather-icons/design/fill/animation-ready/sleet.svg";
import Snow from "@bybas/weather-icons/design/fill/animation-ready/snow.svg";
import Thunderstorms from "@bybas/weather-icons/design/fill/animation-ready/thunderstorms.svg";

/** Коды состояний Tomorrow.io. Названия — из их документации. */
export const WEATHER_CODE = {
  unknown: 0,
  clear: 1000,
  mostlyClear: 1100,
  partlyCloudy: 1101,
  mostlyCloudy: 1102,
  cloudy: 1001,
  fog: 2000,
  lightFog: 2100,
  drizzle: 4000,
  rain: 4001,
  lightRain: 4200,
  heavyRain: 4201,
  snow: 5000,
  flurries: 5001,
  lightSnow: 5100,
  heavySnow: 5101,
  freezingDrizzle: 6000,
  freezingRain: 6001,
  lightFreezingRain: 6200,
  heavyFreezingRain: 6201,
  icePellets: 7000,
  heavyIcePellets: 7101,
  lightIcePellets: 7102,
  thunderstorm: 8000,
} as const;

type IconUrl = string;

// Таблицы объявлены на уровне модуля, а не внутри функции: раньше объект
// пересоздавался на каждый вызов из шаблона.
const DAY_ICONS: Readonly<Record<number, IconUrl>> = {
  [WEATHER_CODE.clear]: ClearDay,
  [WEATHER_CODE.mostlyClear]: ClearDay,
  [WEATHER_CODE.partlyCloudy]: PartlyCloudyDay,
  [WEATHER_CODE.mostlyCloudy]: OvercastDay,
  [WEATHER_CODE.cloudy]: Cloudy,
  [WEATHER_CODE.fog]: FogDay,
  [WEATHER_CODE.lightFog]: FogDay,
  [WEATHER_CODE.drizzle]: Drizzle,
  [WEATHER_CODE.rain]: Rain,
  [WEATHER_CODE.lightRain]: PartlyCloudyDayRain,
  [WEATHER_CODE.heavyRain]: Rain,
  [WEATHER_CODE.snow]: Snow,
  [WEATHER_CODE.flurries]: Snow,
  [WEATHER_CODE.lightSnow]: Snow,
  [WEATHER_CODE.heavySnow]: Snow,
  [WEATHER_CODE.freezingDrizzle]: Sleet,
  [WEATHER_CODE.freezingRain]: Sleet,
  [WEATHER_CODE.lightFreezingRain]: PartlyCloudyDaySleet,
  [WEATHER_CODE.heavyFreezingRain]: Sleet,
  [WEATHER_CODE.icePellets]: Sleet,
  [WEATHER_CODE.heavyIcePellets]: Sleet,
  [WEATHER_CODE.lightIcePellets]: Sleet,
  [WEATHER_CODE.thunderstorm]: Thunderstorms,
};

const NIGHT_ICONS: Readonly<Record<number, IconUrl>> = {
  [WEATHER_CODE.clear]: ClearNight,
  [WEATHER_CODE.mostlyClear]: ClearNight,
  [WEATHER_CODE.partlyCloudy]: PartlyCloudyNight,
  [WEATHER_CODE.mostlyCloudy]: OvercastNight,
  [WEATHER_CODE.cloudy]: Cloudy,
  [WEATHER_CODE.fog]: FogNight,
  [WEATHER_CODE.lightFog]: FogNight,
  [WEATHER_CODE.drizzle]: Drizzle,
  [WEATHER_CODE.rain]: Rain,
  [WEATHER_CODE.lightRain]: PartlyCloudyNightRain,
  [WEATHER_CODE.heavyRain]: Rain,
  [WEATHER_CODE.snow]: Snow,
  [WEATHER_CODE.flurries]: Snow,
  [WEATHER_CODE.lightSnow]: Snow,
  [WEATHER_CODE.heavySnow]: Snow,
  [WEATHER_CODE.freezingDrizzle]: Sleet,
  [WEATHER_CODE.freezingRain]: Sleet,
  [WEATHER_CODE.lightFreezingRain]: PartlyCloudyNightSleet,
  [WEATHER_CODE.heavyFreezingRain]: Sleet,
  [WEATHER_CODE.icePellets]: Sleet,
  [WEATHER_CODE.heavyIcePellets]: Sleet,
  [WEATHER_CODE.lightIcePellets]: Sleet,
  [WEATHER_CODE.thunderstorm]: Thunderstorms,
};

/** Иконка по коду; undefined для неизвестного кода или code === 0. */
export function getWeatherIcon(
  weatherCode: number | undefined,
  variant: "day" | "night",
): IconUrl | undefined {
  if (weatherCode === undefined) return undefined;
  return (variant === "day" ? DAY_ICONS : NIGHT_ICONS)[weatherCode];
}
