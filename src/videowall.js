import createSnowCamApp from "./app";
import App from "./VideoWall.vue";
import SplashscreenImage from "./splashscreen.png";

createSnowCamApp(App, {
  splashImage: SplashscreenImage,
});
