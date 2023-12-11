import ClearDay from "@bybas/weather-icons/design/fill/animation-ready/clear-day.svg";
import ClearNight from "@bybas/weather-icons/design/fill/animation-ready/clear-night.svg";
import Cloudy from "@bybas/weather-icons/design/fill/animation-ready/cloudy.svg";
import Drizzle from "@bybas/weather-icons/design/fill/animation-ready/drizzle.svg";
import FogDay from "@bybas/weather-icons/design/fill/animation-ready/fog-day.svg";
import FogNight from "@bybas/weather-icons/design/fill/animation-ready/fog-night.svg";
import OvercastDay from "@bybas/weather-icons/design/fill/animation-ready/overcast-day.svg";
import OvercastNight from "@bybas/weather-icons/design/fill/animation-ready/overcast-night.svg";
import PartlyCloudyDayRain from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-day-rain.svg";
import PartlyCloudyDaySleet from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-day-sleet.svg";
import PartlyCloudyDay from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-day.svg";
import PartlyCloudyNightRain from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-night-rain.svg";
import PartlyCloudyNightSleet from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-night-sleet.svg";
import PartlyCloudyNight from "@bybas/weather-icons/design/fill/animation-ready/partly-cloudy-night.svg";
import Rain from "@bybas/weather-icons/design/fill/animation-ready/rain.svg";
import Sleet from "@bybas/weather-icons/design/fill/animation-ready/sleet.svg";
import Snow from "@bybas/weather-icons/design/fill/animation-ready/snow.svg";
import Thunderstorms from "@bybas/weather-icons/design/fill/animation-ready/thunderstorms.svg";

const getDayIcon = (weatherCode) => {
  const codes = {
    0: null, // "Unknown",
    1000: ClearDay, // "Clear, Sunny",
    1100: ClearDay, // "Mostly Clear",
    1101: PartlyCloudyDay, // "Partly Cloudy",
    1102: OvercastDay, // "Mostly Cloudy",
    1001: Cloudy, // "Cloudy",
    2000: FogDay, // "Fog",
    2100: FogDay, // "Light Fog",
    4000: Drizzle, // "Drizzle",
    4001: Rain, // "Rain",
    4200: PartlyCloudyDayRain, // "Light Rain",
    4201: Rain, // "Heavy Rain",
    5000: Snow, // "Snow",
    5001: Snow, // "Flurries",
    5100: Snow, // "Light Snow",
    5101: Snow, // "Heavy Snow",
    6000: Sleet, // "Freezing Drizzle",
    6001: Sleet, // "Freezing Rain",
    6200: PartlyCloudyDaySleet, // "Light Freezing Rain",
    6201: Sleet, // "Heavy Freezing Rain",
    7000: Sleet, // "Ice Pellets",
    7101: Sleet, // "Heavy Ice Pellets",
    7102: Sleet, // "Light Ice Pellets",
    8000: Thunderstorms, // "Thunderstorm"
  };
  return codes[weatherCode];
};

const getNightIcon = (weatherCode) => {
  const codes = {
    0: null, // "Unknown",
    1000: ClearNight, // "Clear, Sunny",
    1100: ClearNight, // "Mostly Clear",
    1101: PartlyCloudyNight, // "Partly Cloudy",
    1102: OvercastNight, // "Mostly Cloudy",
    1001: Cloudy, // "Cloudy",
    2000: FogNight, // "Fog",
    2100: FogNight, // "Light Fog",
    4000: Drizzle, // "Drizzle",
    4001: Rain, // "Rain",
    4200: PartlyCloudyNightRain, // "Light Rain",
    4201: Rain, // "Heavy Rain",
    5000: Snow, // "Snow",
    5001: Snow, // "Flurries",
    5100: Snow, // "Light Snow",
    5101: Snow, // "Heavy Snow",
    6000: Sleet, // "Freezing Drizzle",
    6001: Sleet, // "Freezing Rain",
    6200: PartlyCloudyNightSleet, // "Light Freezing Rain",
    6201: Sleet, // "Heavy Freezing Rain",
    7000: Sleet, // "Ice Pellets",
    7101: Sleet, // "Heavy Ice Pellets",
    7102: Sleet, // "Light Ice Pellets",
    8000: Thunderstorms, // "Thunderstorm"
  };
  return codes[weatherCode];
};

export { getDayIcon, getNightIcon };
