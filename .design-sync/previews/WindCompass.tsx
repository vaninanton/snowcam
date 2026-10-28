import { WindCompass } from "snowcam";

const directions = [0, 45, 90, 135, 180, 225, 270, 315];

/** Восемь направлений ветра. */
export const Directions = () => (
  <div className="flex w-fit gap-6 bg-slate-900 p-4 text-2xl text-slate-300">
    {directions.map((deg) => (
      <div key={deg} className="flex flex-col items-center gap-1">
        <WindCompass windDirection={deg} />
        <span className="text-xs text-slate-500">{deg}°</span>
      </div>
    ))}
  </div>
);

/** В строке деталей виджета погоды. */
export const InDetails = () => (
  <div className="w-fit bg-slate-900 p-4 text-xs text-slate-400">
    <span className="whitespace-nowrap inline-flex items-center gap-1">
      <WindCompass
        windDirection={315}
        className="text-sm align-middle mr-0.5 shrink-0"
      />
      Ветер 6 м/с (до 11)
    </span>
  </div>
);
