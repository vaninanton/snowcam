import { TimelineItem } from "snowcam";

const hour = new Date();
hour.setMinutes(0, 0, 0);

const forecast: [number, number, number][] = [
  // [погода, температура, ощущается]
  [5100, -6.4, -11.2],
  [5100, -6.8, -12.1],
  [1102, -7.5, -12.9],
  [1101, -8.1, -13.4],
  [1000, -9.0, -9.0],
  [1000, -9.6, -14.8],
  [1101, -8.2, -12.0],
  [1001, -7.1, -7.1],
];

function at(offsetHours: number, [code, t, ta]: [number, number, number]) {
  return {
    startTime: new Date(hour.getTime() + offsetHours * 3600_000).toISOString(),
    values: { weatherCode: code, temperature: t, temperatureApparent: ta },
  };
}

/** Текущий час: подпись «Сейчас» и подсветка. */
export const Current = () => (
  <div className="w-fit bg-slate-900 text-slate-400">
    <div className="h-[90px] w-16 bg-white/5">
      <TimelineItem timeline={at(0, forecast[0])} />
    </div>
  </div>
);

/** Полоса прогноза, как в виджете погоды. */
export const Strip = () => (
  <div className="w-[560px] bg-slate-900 text-slate-400">
    <div className="flex snap-x snap-mandatory overflow-x-scroll w-full divide-x divide-gray-800 bg-white/5 py-1 min-w-0">
      {forecast.map((entry, index) => {
        const timeline = at(index, entry);
        return (
          <div className="flex-1" key={timeline.startTime}>
            <TimelineItem timeline={timeline} />
          </div>
        );
      })}
    </div>
  </div>
);
