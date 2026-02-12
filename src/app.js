import { createApp } from "vue";
import "./style.css";
import iosPWASplash from "ios-pwa-splash/index";
import httpPlugin from "./http";

const SPLASH_BG = "#0f172a";

/**
 * Создаёт и монтирует Vue-приложение с общими плагинами (http).
 * @param {import('vue').Component} RootComponent - корневой компонент
 * @param {Object} options
 * @param {string} [options.splashImage] - путь к изображению для iOS PWA splash
 * @param {Function} [options.beforeMount] - вызывается с app перед app.mount()
 */
export default function createSnowCamApp(RootComponent, options = {}) {
  const app = createApp(RootComponent);
  app.use(httpPlugin);

  if (typeof options.beforeMount === "function") {
    options.beforeMount(app);
  }

  app.mount("#app");

  if (options.splashImage) {
    iosPWASplash(options.splashImage, SPLASH_BG);
  }
}
