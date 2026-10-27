import { lazy, Suspense, useState } from "react";
import { SHOWN_COOKIE } from "@/components/AddToHomescreen";
import { cameras, places } from "@/data/cameras";
import { clearCache } from "@/hooks/useWeather";
import { cx } from "@/lib/cx";

const STORAGE_KEY_PLACE = "snowcam-place-tab";

const WeatherWidget = lazy(() => import("@/components/weather/WeatherWidget"));
const HlsVideo = lazy(() => import("@/components/HlsVideo"));
const VersionString = lazy(() => import("@/components/VersionString"));

function readSavedPlace(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PLACE);
    if (saved !== null && places.includes(saved)) return saved;
  } catch {
    // localStorage недоступен — берём первую локацию
  }
  return places[0] ?? "";
}

function savePlace(place: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLACE, place);
  } catch {
    // localStorage недоступен (приватный режим, отключённые куки)
  }
}

/** Сбрасывает кэш погоды и подсказку об установке, затем перезагружает страницу. */
function clearCacheAndReload(): void {
  clearCache();
  document.cookie = `${SHOWN_COOKIE}=; Max-Age=0; Path=/`;
  window.location.reload();
}

export default function HomePage() {
  const [activePlace, setActivePlace] = useState(readSavedPlace);

  const visibleCameras = cameras.filter(
    (camera) => camera.place === activePlace && camera.src,
  );

  function selectPlace(place: string): void {
    setActivePlace(place);
    savePlace(place);
  }

  return (
    <>
      <Suspense>
        <WeatherWidget />
      </Suspense>
      {places.length > 1 && (
        <div className="flex border-b border-slate-700 mt-2 mb-2 sm:px-6 xl:px-8 gap-0">
          {places.map((place) => (
            <button
              key={place}
              type="button"
              className={cx(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activePlace === place
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600",
              )}
              onClick={() => selectPlace(place)}
            >
              {place}
            </button>
          ))}
        </div>
      )}
      <ul className="grid max-w-full mt-4 mb-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 mx-auto gap-4 xl:gap-y-6 xl:gap-x-8 xl:max-w-full sm:px-6 xl:px-8">
        {visibleCameras.map((camera) => (
          <li key={camera.title}>
            <div>
              <div className="p-2 sm:p-0">
                <h2 className="font-semibold">
                  {camera.title}
                  {camera.elevation > 0 && `, ${camera.elevation} м`}
                </h2>
              </div>
              <Suspense>
                <HlsVideo
                  src={camera.src}
                  poster={camera.poster}
                  muted
                  controls
                  playsInline
                  autoPlay
                />
              </Suspense>
            </div>
          </li>
        ))}
      </ul>
      <Suspense>
        <VersionString onClick={clearCacheAndReload} />
      </Suspense>
    </>
  );
}
