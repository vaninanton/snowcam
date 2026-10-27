import type { ReactNode } from "react";
import TimelineItem from "./TimelineItem";
import WeatherIcon from "./WeatherIcon";
import WeatherPlaceholder from "./WeatherPlaceholder";
import WindCompass from "./WindCompass";
import { deriveConditions, type SkiConditions } from "./conditions";
import { floorOrNull, roundOrNull } from "./format";
import { useWeather, type WeatherData } from "@/hooks/useWeather";
import { cx } from "@/lib/cx";
import type { WeatherValues } from "@/types/tomorrow";

function visibilityKm(values: WeatherValues): string | null {
  const raw = values.visibility;
  if (raw == null) return null;
  // При units=metric API отдаёт видимость уже в км
  const km = raw >= 1000 ? raw / 1000 : raw;
  return km >= 1 ? String(Math.round(km)) : km.toFixed(1);
}

interface Detail {
  text: string;
  /** Только у пункта про ветер: рядом с ним рисуется стрелка. */
  windDirection?: number;
}

/** Строка под температурой. Разделитель ставится только между непустыми. */
function describeDetails(
  values: WeatherValues,
  conditions: SkiConditions,
): Detail[] {
  const windSpeed = roundOrNull(values.windSpeed);
  const windGust = roundOrNull(values.windGust);
  const humidity = roundOrNull(values.humidity);
  const precipProbability = roundOrNull(values.precipitationProbability);
  const visibility = visibilityKm(values);

  const items: Detail[] = [];
  if (windSpeed !== null) {
    const gust =
      windGust !== null && windGust > windSpeed ? ` (до ${windGust})` : "";
    items.push({
      text: `Ветер ${windSpeed} м/с${gust}`,
      windDirection: values.windDirection ?? undefined,
    });
  }
  if (visibility !== null) items.push({ text: `Видимость ${visibility} км` });
  if (humidity !== null) items.push({ text: `Влажность ${humidity}%` });
  if (precipProbability !== null && precipProbability > 0)
    items.push({ text: `Осадки ${precipProbability}%` });
  const { tempMin, tempMax } = conditions;
  if (tempMin !== null && tempMax !== null)
    items.push({
      text: `Ночью ${Math.round(tempMin)}° / днём ${Math.round(tempMax)}°`,
    });
  const uv = conditions.uvIndexMax;
  // На 3200 м со снегом УФ жжёт заметно сильнее, но при слабом смысла нет
  if (uv !== null && uv >= 3) items.push({ text: `УФ до ${Math.round(uv)}` });
  return items;
}

/** Снежная сводка. Пустая — блок не рендерится вовсе. */
function describeSnow({
  freshSnowCm,
  expectedSnowCm,
  isSnowingNow,
}: SkiConditions): string[] {
  const notes: string[] = [];
  if (isSnowingNow) notes.push("Идёт снег");
  if (freshSnowCm !== null) notes.push(`Свежего ${freshSnowCm} см за сутки`);
  if (expectedSnowCm !== null) notes.push(`Ожидается ${expectedSnowCm} см`);
  return notes;
}

/** Предупреждения о том, что кататься будет плохо. */
function describeWarnings({
  isWindAlert,
  windGustMaxMs,
  isLowVisibility,
  isRainOnSnow,
  isFreezeThaw,
}: SkiConditions): string[] {
  const items: string[] = [];
  if (isWindAlert && windGustMaxMs !== null)
    items.push(
      `Порывы до ${Math.round(windGustMaxMs)} м/с — подъёмники могут стоять`,
    );
  if (isLowVisibility) items.push("Плохая видимость");
  if (isRainOnSnow) items.push("Дождь на склоне");
  if (isFreezeThaw) items.push("Ночью подмерзает — утром жёстко");
  return items;
}

/** Строка пунктов через «·». Разделитель внутри элемента, иначе при переносе
 * строки он остаётся висеть в её конце. */
function DottedList({
  items,
  className,
  icon,
}: {
  items: string[];
  className: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cx(
        "px-1 mb-2 sm:px-0 sm:max-w-2xl sm:mx-auto flex flex-wrap items-baseline gap-x-1",
        className,
      )}
    >
      {icon}
      {items.map((item, index) => (
        <span key={item} className="whitespace-nowrap">
          {index > 0 && <span className="text-slate-600">·&nbsp;</span>}
          {item}
        </span>
      ))}
    </div>
  );
}

function Forecast({ data }: { data: WeatherData }) {
  const { current, hourly, pastHourly, daily } = data;
  const values = current?.values ?? {};
  const conditions = deriveConditions(current, pastHourly, daily);

  const currentTemp = floorOrNull(values.temperature);
  const feelsLike = floorOrNull(values.temperatureApparent);
  const details = describeDetails(values, conditions);
  const snowNotes = describeSnow(conditions);
  const warnings = describeWarnings(conditions);

  return (
    <div>
      <div className="flex flex-row items-center gap-4 mb-2 my-4 px-1 sm:px-0 sm:max-w-2xl sm:mx-auto">
        <div className="flex items-center gap-3 shrink-0">
          {current && (
            <WeatherIcon
              timeline={current}
              className="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
            />
          )}
          <div>
            <div className="text-4xl sm:text-5xl font-extralight leading-none">
              {currentTemp ?? "-"}
              <sup>°</sup>
            </div>
            {feelsLike !== null && (
              <p className="text-slate-500 text-xs mt-0.5">
                Ощущается {feelsLike}°
              </p>
            )}
          </div>
        </div>
        <div className="text-slate-400 text-xs min-w-0 flex-1 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
          {details.map(({ text, windDirection }, index) => (
            <span
              key={text}
              className="whitespace-nowrap inline-flex items-center gap-1"
            >
              {index > 0 && <span className="text-slate-600">·</span>}
              {windDirection !== undefined && (
                <WindCompass
                  windDirection={windDirection}
                  className="text-sm align-middle mr-0.5 shrink-0"
                />
              )}
              {text}
            </span>
          ))}
        </div>
      </div>

      {snowNotes.length > 0 && (
        <DottedList
          items={snowNotes}
          className="text-sm text-sky-300"
          icon={<span aria-hidden="true">❄</span>}
        />
      )}

      {warnings.length > 0 && (
        <DottedList items={warnings} className="text-xs text-amber-400/90" />
      )}

      <div className="flex snap-x snap-mandatory overflow-x-scroll w-full divide-x divide-gray-800 bg-white/5 py-1 min-w-0">
        {hourly.map((item) => (
          <div className="flex-1" key={item.startTime}>
            <TimelineItem timeline={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeatherWidget() {
  const weather = useWeather();

  if (weather.status === "loading") return <WeatherPlaceholder />;
  if (weather.status === "error") {
    return (
      <div className="px-1 py-4 text-slate-500 sm:px-0 sm:max-w-2xl sm:mx-auto">
        Погода недоступна
      </div>
    );
  }
  return <Forecast data={weather.data} />;
}
