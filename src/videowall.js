import { createApp } from "vue";
import "./style.css";
import iosPWASplash from "ios-pwa-splash/index";
import App from "./VideoWall.vue";
import httpPlugin from "./http";
import Icon from "./splashscreen.png";

const app = createApp(App);
app.use(httpPlugin);
app.mount("#app");

iosPWASplash(Icon, "#0f172a");
