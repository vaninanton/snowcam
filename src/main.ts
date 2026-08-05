import AddToHomescreen from "@owliehq/vue-addtohomescreen";
import { createSnowCamApp } from "./createApp";
import HomePage from "./pages/HomePage.vue";
import splashImage from "./splashscreen.png";

createSnowCamApp(HomePage, {
  splashImage,
  beforeMount(app) {
    app.use(AddToHomescreen, {
      title: "SnowCam",
      content: "Можно установить как приложение на homescreen!",
      iconPath: "/android-chrome-512x512.png",
      lang: "ru_RU",
    });
  },
});
