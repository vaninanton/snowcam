import { createApp, type App, type Component } from "vue";
import iosPWASplash from "ios-pwa-splash/index";
import "./style.css";

const SPLASH_BG = "#0f172a";

export interface SnowCamAppOptions {
  /** Изображение для iOS PWA splash. */
  splashImage?: string;
  /** Вызывается с приложением до mount — для плагинов конкретной страницы. */
  beforeMount?: (app: App) => void;
}

/** Создаёт и монтирует приложение в #app. Общая точка для всех входов. */
export function createSnowCamApp(
  RootComponent: Component,
  options: SnowCamAppOptions = {},
): App {
  const app = createApp(RootComponent);

  options.beforeMount?.(app);
  app.mount("#app");

  if (options.splashImage) {
    iosPWASplash(options.splashImage, SPLASH_BG);
  }

  return app;
}
