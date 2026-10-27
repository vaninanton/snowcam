import dayjs from "./dayjs";
import { getWeatherIcon } from "./icons";
import type { TimelineInterval } from "@/types/tomorrow";

/** Ночь — если момент не раньше заката либо не позже восхода. */
function isNight({ startTime, values }: TimelineInterval): boolean {
  const { sunriseTime, sunsetTime } = values;
  const at = dayjs(startTime);
  return (
    (sunsetTime !== undefined && at.isSameOrAfter(sunsetTime)) ||
    (sunriseTime !== undefined && at.isSameOrBefore(sunriseTime))
  );
}

export default function WeatherIcon({
  timeline,
  className,
}: {
  timeline: TimelineInterval;
  className?: string;
}) {
  const icon = getWeatherIcon(
    timeline.values.weatherCode,
    isNight(timeline) ? "night" : "day",
  );
  if (!icon) return null;

  return (
    <img
      className={className}
      src={icon}
      alt={String(timeline.values.weatherCode)}
    />
  );
}
