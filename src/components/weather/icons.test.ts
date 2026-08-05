import { describe, expect, it } from "vitest";
import { getWeatherIcon, WEATHER_CODE } from "./icons";

describe("getWeatherIcon", () => {
  it("отдаёт разные иконки для дня и ночи при ясной погоде", () => {
    const day = getWeatherIcon(WEATHER_CODE.clear, "day");
    const night = getWeatherIcon(WEATHER_CODE.clear, "night");

    expect(day).toBeTruthy();
    expect(night).toBeTruthy();
    expect(day).not.toBe(night);
  });

  it("отдаёт одну и ту же иконку там, где время суток не важно", () => {
    expect(getWeatherIcon(WEATHER_CODE.cloudy, "day")).toBe(
      getWeatherIcon(WEATHER_CODE.cloudy, "night"),
    );
    expect(getWeatherIcon(WEATHER_CODE.snow, "day")).toBe(
      getWeatherIcon(WEATHER_CODE.snow, "night"),
    );
  });

  it("возвращает undefined для неизвестного кода и для кода 0", () => {
    expect(getWeatherIcon(WEATHER_CODE.unknown, "day")).toBeUndefined();
    expect(getWeatherIcon(4242, "day")).toBeUndefined();
    expect(getWeatherIcon(undefined, "day")).toBeUndefined();
  });

  it("покрывает все объявленные коды, кроме unknown", () => {
    const codes = Object.entries(WEATHER_CODE).filter(
      ([name]) => name !== "unknown",
    );

    for (const [name, code] of codes) {
      expect(getWeatherIcon(code, "day"), `день: ${name}`).toBeTruthy();
      expect(getWeatherIcon(code, "night"), `ночь: ${name}`).toBeTruthy();
    }
  });
});
