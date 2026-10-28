import { WeatherWidget } from "snowcam";

// Виджет берёт погоду из кэша в localStorage, если тот свежий (до 6 часов).
// Кладём туда правдоподобный ответ Tomorrow.io: снегопад на Шымбулаке,
// сильные порывы и переход через ноль — видны все строки виджета.
const HOUR_MS = 3600_000;
const thisHour = new Date();
thisHour.setMinutes(0, 0, 0);
const today = new Date();
today.setHours(0, 0, 0, 0);
const sunrise = new Date(today.getTime() + 7 * HOUR_MS).toISOString();
const sunset = new Date(today.getTime() + 18 * HOUR_MS).toISOString();

const iso = (ms: number) => new Date(ms).toISOString();

const hourly = Array.from({ length: 48 }, (_, i) => {
  const offset = i - 24;
  const t = -6 - 3 * Math.sin((i / 24) * Math.PI);
  return {
    startTime: iso(thisHour.getTime() + offset * HOUR_MS),
    values: {
      temperature: t,
      temperatureApparent: t - 5,
      weatherCode: offset < 6 ? 5100 : offset < 12 ? 1102 : 1000,
      snowAccumulation: offset < 0 ? 6 : 0,
      windSpeed: 6,
      windDirection: 315,
    },
  };
});

const data = {
  data: {
    timelines: [
      {
        timestep: "current",
        intervals: [
          {
            startTime: iso(Date.now()),
            values: {
              temperature: -6.4,
              temperatureApparent: -11.2,
              weatherCode: 5100,
              windSpeed: 6.2,
              windGust: 11.4,
              windDirection: 315,
              humidity: 87,
              visibility: 4.2,
              precipitationProbability: 75,
              precipitationType: 2,
              snowIntensity: 1.3,
            },
          },
        ],
      },
      { timestep: "1h", intervals: hourly },
      {
        timestep: "1d",
        intervals: [0, 1, 2, 3].map((day) => ({
          startTime: iso(today.getTime() + day * 24 * HOUR_MS),
          values: {
            temperatureMin: -9.8,
            temperatureMax: 1.2,
            windGustMax: 17,
            uvIndexMax: 5,
            snowAccumulationSum: day < 2 ? 90 : 0,
            sunriseTime: sunrise,
            sunsetTime: sunset,
          },
        })),
      },
    ],
  },
};

localStorage.setItem(
  "tomorrowioData",
  JSON.stringify({ data, timestamp: Date.now() }),
);

/** Прогноз с данными: шапка, детали, снег, предупреждения и полоса по часам. */
export const Forecast = () => (
  <div className="w-[720px] bg-slate-900 text-slate-400">
    <WeatherWidget />
  </div>
);
