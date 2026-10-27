import dayjs from "./dayjs";
import WeatherIcon from "./WeatherIcon";
import { cx } from "@/lib/cx";
import type { TimelineInterval } from "@/types/tomorrow";

function floorOrNull(value: number | undefined): number | null {
  return value === undefined ? null : Math.floor(value);
}

export default function TimelineItem({
  timeline,
}: {
  timeline: TimelineInterval;
}) {
  const isCurrent = dayjs(timeline.startTime).isSame(dayjs().startOf("hour"));
  const label = isCurrent
    ? "Сейчас"
    : `${dayjs(timeline.startTime).format("HH")}:00`;
  const temperature = floorOrNull(timeline.values.temperature);
  const temperatureApparent = floorOrNull(timeline.values.temperatureApparent);

  return (
    <div
      className={cx(
        "w-16 min-w-16 p-1.5 h-full flex flex-col justify-between text-center text-xs",
        isCurrent && "bg-white/10",
      )}
    >
      <div>
        <div className="font-normal mb-0.5">{label}</div>
        <WeatherIcon className="w-8 h-8 mx-auto block" timeline={timeline} />

        <div className="whitespace-nowrap">
          <span className="font-bold text-sm">
            {temperature}
            <sup>°</sup>
          </span>
          {temperatureApparent !== null &&
            temperature !== temperatureApparent && (
              <span className="font-light">
                {" "}
                ({temperatureApparent}
                <sup>°</sup>)
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
