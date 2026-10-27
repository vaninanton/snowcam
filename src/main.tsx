import { createSnowCamApp } from "./createApp";
import AddToHomescreen from "./components/AddToHomescreen";
import HomePage from "./pages/HomePage";
import splashImage from "./splashscreen.png";

createSnowCamApp(
  <>
    <HomePage />
    <AddToHomescreen />
  </>,
  { splashImage },
);
