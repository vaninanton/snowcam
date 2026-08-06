import type { Camera } from "@/types/camera";

export const cameras: readonly Camera[] = [
  {
    place: "Шымбулак",
    title: "Ледник Богдановича",
    description: "Верхняя станция",
    elevation: 3200,
    src: "https://ipcam.kz/cam6/index.m3u8",
    poster: "/previews/892c6cefe6ea6b6bdf083233c8fd37b6.webp",
  },
  {
    place: "Шымбулак",
    title: "Средняя станция",
    description: "Средняя станция",
    elevation: 2800,
    src: "https://ipcam.kz/cam5/index.m3u8",
    poster: "/previews/0b0681651d4e3468052a3e11dec7d983.webp",
  },
  {
    place: "Шымбулак",
    title: "Подъемник",
    description: "Базовая станция",
    elevation: 2300,
    src: "https://ipcam.kz/cam1/index.m3u8",
    poster: "/previews/d5e9db37c506562c992e108f46896797.webp",
  },
  {
    place: "Шымбулак",
    title: "Бугель",
    description: "Базовая станция",
    elevation: 2300,
    src: "https://ipcam.kz/cam2/index.m3u8",
    poster: "/previews/c08c43b9f4a973c8f980057d4f948de2.webp",
  },
];

/** Локации в порядке появления в списке камер. */
export const places: readonly string[] = [
  ...new Set(cameras.map((camera) => camera.place)),
];
