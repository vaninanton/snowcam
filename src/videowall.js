import { createApp } from "vue";
import "./style.css";
import iosPWASplash from "ios-pwa-splash/index";
import App from "./components/VideoWall.vue";
import httpPlugin from "./http";
import Icon from "./splashscreen.png";
import AddToHomescreen from "@owliehq/vue-addtohomescreen";

const app = createApp(App);
app.config.globalProperties.$isLoading = false;
app.use(httpPlugin);
app.use(AddToHomescreen, {
  title: "SnowCam",
  buttonColor: "blue",
});
app.mount("#app");

iosPWASplash(Icon, "#0f172a");
