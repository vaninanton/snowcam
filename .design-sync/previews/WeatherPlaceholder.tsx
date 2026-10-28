import { WeatherPlaceholder } from "snowcam";

/** Заглушка загрузки погоды. */
export const Loading = () => (
  <div className="w-[720px] bg-slate-900 text-slate-400">
    <WeatherPlaceholder />
  </div>
);
