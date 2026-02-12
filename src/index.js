import AddToHomescreen from "@owliehq/vue-addtohomescreen";
import createSnowCamApp from "./app";
import App from "./Index.vue";
import SplashscreenImage from "./splashscreen.png";

createSnowCamApp(App, {
  splashImage: SplashscreenImage,
  beforeMount(app) {
    app.use(AddToHomescreen, {
      title: "SnowCam",
      content: "Можно установить как приложение на homescreen!",
      iconPath: "/android-chrome-512x512.png",
      lang: "ru_RU",
    });
  },
});
