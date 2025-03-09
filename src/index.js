import { createApp } from "vue";
import "./style.css";
import iosPWASplash from "ios-pwa-splash/index";
import App from "./Index.vue";
import httpPlugin from "./http";
import SplashscreenImage from "./splashscreen.png";
import AddToHomescreen from "@owliehq/vue-addtohomescreen";

const app = createApp(App);
app.config.globalProperties.$isLoading = false;
app.use(httpPlugin);
app.use(AddToHomescreen, {
  title: "SnowCam",
  content: "Можно установить как приложение на homescreen!",
  iconPath: "/android-chrome-512x512.png",
  lang: "ru_RU",
});
app.mount("#app");

iosPWASplash(SplashscreenImage, "#0f172a");
