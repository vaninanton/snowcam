import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import iosPWASplash from "ios-pwa-splash/index.js";

createApp(App).mount("#app");
iosPWASplash("android-chrome-512x512.png", "#0f172a");
