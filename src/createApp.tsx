import { StrictMode, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import iosPWASplash from "ios-pwa-splash/index";
import "./style.css";

const SPLASH_BG = "#0f172a";

export interface SnowCamAppOptions {
  /** Изображение для iOS PWA splash. */
  splashImage?: string;
}

/** Создаёт и монтирует приложение в #app. Общая точка для всех входов. */
export function createSnowCamApp(
  root: ReactNode,
  options: SnowCamAppOptions = {},
): Root {
  const container = document.getElementById("app");
  if (!container) throw new Error("Не найден контейнер #app");

  const app = createRoot(container);
  app.render(<StrictMode>{root}</StrictMode>);

  if (options.splashImage) {
    iosPWASplash(options.splashImage, SPLASH_BG);
  }

  return app;
}
