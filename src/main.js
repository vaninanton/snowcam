import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import iosPWASplash from "ios-pwa-splash/index.js";
import httpPlugin from "./http.js";

const app = createApp(App);
app.config.globalProperties.$isLoading = false;
app.use(httpPlugin);
app.mount("#app");

iosPWASplash("android-chrome-512x512.png", "#0f172a");
