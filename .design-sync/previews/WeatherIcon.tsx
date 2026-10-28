import { WeatherIcon } from "snowcam";

const codes: [number, string][] = [
  [1000, "Ясно"],
  [1101, "Переменная облачность"],
  [1102, "Облачно"],
  [1001, "Пасмурно"],
  [2000, "Туман"],
  [4001, "Дождь"],
  [5000, "Снег"],
  [6001, "Ледяной дождь"],
  [8000, "Гроза"],
];

const noon = new Date();
noon.setHours(12, 0, 0, 0);
const midnight = new Date();
midnight.setHours(1, 0, 0, 0);
const sunrise = new Date();
sunrise.setHours(7, 0, 0, 0);

function IconGrid({ at }: { at: Date }) {
  return (
    <div className="grid grid-cols-5 gap-4 bg-slate-900 p-4 text-xs text-slate-400">
      {codes.map(([code, label]) => (
        <div
          key={code}
          className="flex flex-col items-center gap-1 text-center"
        >
          <WeatherIcon
            className="w-14 h-14"
            timeline={{
              startTime: at.toISOString(),
              values: { weatherCode: code, sunriseTime: sunrise.toISOString() },
            }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/** Дневные иконки. */
export const Day = () => <IconGrid at={noon} />;

/** Ночные иконки: момент раньше восхода. */
export const Night = () => <IconGrid at={midnight} />;
