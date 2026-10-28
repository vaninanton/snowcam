// Точка входа бандла для Claude Design (design-sync). Компоненты в src/
// экспортируются по умолчанию, а бандлу нужны именованные экспорты —
// они станут window.SnowCam.<Name>.
export { default as AddToHomescreen } from "../src/components/AddToHomescreen";
export { default as CameraVideo } from "../src/components/CameraVideo";
export { default as HlsVideo } from "../src/components/HlsVideo";
export { default as VersionString } from "../src/components/VersionString";
export { default as TimelineItem } from "../src/components/weather/TimelineItem";
export { default as WeatherIcon } from "../src/components/weather/WeatherIcon";
export { default as WeatherPlaceholder } from "../src/components/weather/WeatherPlaceholder";
export { default as WeatherWidget } from "../src/components/weather/WeatherWidget";
export { default as WindCompass } from "../src/components/weather/WindCompass";
export { cx } from "../src/lib/cx";
export { cameraGridCols } from "../src/lib/cameraGrid";
