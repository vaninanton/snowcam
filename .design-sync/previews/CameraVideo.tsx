import { CameraVideo, cameraGridCols, cx } from "snowcam";
import glacierPoster from "../../public/previews/892c6cefe6ea6b6bdf083233c8fd37b6.webp";
import middlePoster from "../../public/previews/0b0681651d4e3468052a3e11dec7d983.webp";
import liftPoster from "../../public/previews/d5e9db37c506562c992e108f46896797.webp";

const cameras = [
  {
    place: "Шымбулак",
    title: "Ледник Богдановича",
    description: "Верхняя станция",
    elevation: 3200,
    src: "https://ipcam.kz/cam6/index.m3u8",
    poster: glacierPoster,
  },
  {
    place: "Шымбулак",
    title: "Средняя станция",
    description: "Средняя станция",
    elevation: 2800,
    src: "https://ipcam.kz/cam5/index.m3u8",
    poster: middlePoster,
  },
  {
    place: "Шымбулак",
    title: "Подъемник",
    description: "Базовая станция",
    elevation: 2300,
    src: "https://ipcam.kz/cam1/index.m3u8",
    poster: liftPoster,
  },
];

/** Одна плитка камеры с заголовком, как в списке на главной. */
export const Tile = () => (
  <div className="w-[480px] bg-slate-900 text-slate-400">
    <h2 className="p-2 sm:p-0 font-semibold">
      {cameras[0].title}, {cameras[0].elevation} м
    </h2>
    <CameraVideo camera={cameras[0]} />
  </div>
);

/** Сетка камер главной: три камеры в один ряд. */
export const Grid = () => (
  <div className="w-full bg-slate-900 text-slate-400">
    <ul
      className={cx(
        "grid max-w-full mt-4 mb-4 mx-auto gap-4 xl:gap-y-6 xl:gap-x-8 sm:px-6 xl:px-8",
        cameraGridCols(cameras.length),
      )}
    >
      {cameras.map((camera) => (
        <li key={camera.title}>
          <h2 className="p-2 sm:p-0 font-semibold">
            {camera.title}, {camera.elevation} м
          </h2>
          <CameraVideo camera={camera} />
        </li>
      ))}
    </ul>
  </div>
);
