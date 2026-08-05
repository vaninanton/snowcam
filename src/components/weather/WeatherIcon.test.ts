import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import WeatherIcon from "./WeatherIcon.vue";
import { getWeatherIcon, WEATHER_CODE } from "./icons";
import type { TimelineInterval } from "@/types/tomorrow";

const SUNRISE = "2026-08-05T02:00:00Z";
const SUNSET = "2026-08-05T14:00:00Z";

function interval(startTime: string, extra = {}): TimelineInterval {
  return {
    startTime,
    values: {
      weatherCode: WEATHER_CODE.clear,
      sunriseTime: SUNRISE,
      sunsetTime: SUNSET,
      ...extra,
    },
  };
}

function srcOf(timeline: TimelineInterval): string | undefined {
  return mount(WeatherIcon, { props: { timeline } }).attributes("src");
}

describe("WeatherIcon", () => {
  it("берёт дневную иконку между восходом и закатом", () => {
    expect(srcOf(interval("2026-08-05T08:00:00Z"))).toBe(
      getWeatherIcon(WEATHER_CODE.clear, "day"),
    );
  });

  it("берёт ночную иконку после заката и до восхода", () => {
    const night = getWeatherIcon(WEATHER_CODE.clear, "night");

    expect(srcOf(interval("2026-08-05T20:00:00Z"))).toBe(night);
    expect(srcOf(interval("2026-08-05T00:30:00Z"))).toBe(night);
  });

  it("считает ночью моменты ровно на закате и ровно на восходе", () => {
    const night = getWeatherIcon(WEATHER_CODE.clear, "night");

    expect(srcOf(interval(SUNSET))).toBe(night);
    expect(srcOf(interval(SUNRISE))).toBe(night);
  });

  it("без границ суток остаётся дневным", () => {
    // У часовых интервалов sunrise/sunset может не быть. Раньше отсутствующее
    // значение сравнивалось с «сейчас», и иконка произвольно уходила в ночную.
    const timeline: TimelineInterval = {
      startTime: "2026-08-05T20:00:00Z",
      values: { weatherCode: WEATHER_CODE.clear },
    };

    expect(srcOf(timeline)).toBe(getWeatherIcon(WEATHER_CODE.clear, "day"));
  });

  it("ничего не рендерит для неизвестного кода вместо битой картинки", () => {
    const wrapper = mount(WeatherIcon, {
      props: { timeline: interval("2026-08-05T08:00:00Z", { weatherCode: 0 }) },
    });

    expect(wrapper.find("img").exists()).toBe(false);
  });
});
