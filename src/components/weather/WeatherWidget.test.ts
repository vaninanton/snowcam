import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import WeatherWidget from "./WeatherWidget.vue";
import { WEATHER_CACHE_KEY } from "@/composables/useWeather";
import type { WeatherValues } from "@/types/tomorrow";

function seedCache(values: WeatherValues): void {
  localStorage.setItem(
    WEATHER_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: {
        data: {
          timelines: [
            {
              timestep: "current",
              intervals: [{ startTime: "2026-08-05T18:00:00+05:00", values }],
            },
            { timestep: "1h", intervals: [] },
            { timestep: "1d", intervals: [] },
          ],
        },
      },
    }),
  );
}

async function render(values: WeatherValues) {
  seedCache(values);
  const wrapper = mount(WeatherWidget);
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv("VITE_TOMORROW_API_KEY", "TEST_KEY");
});

describe("WeatherWidget", () => {
  // Регрессия: snowDepth вне США приходит как null, а Math.round(null) === 0,
  // из-за чего в строке появлялся выдуманный «Снег 0 см»
  it("не показывает снег, когда API прислал null", async () => {
    const wrapper = await render({
      temperature: 5.4,
      windSpeed: 1.2,
      snowDepth: null as unknown as number,
    });

    expect(wrapper.text()).not.toContain("Снег");
  });

  it("не показывает снег, когда поля вообще нет", async () => {
    const wrapper = await render({ temperature: 5.4, windSpeed: 1.2 });

    expect(wrapper.text()).not.toContain("Снег");
  });

  it("показывает снег, когда значение реальное", async () => {
    const wrapper = await render({ temperature: -3, snowDepth: 42 });

    expect(wrapper.text()).toContain("Снег 42 см");
  });

  it("округляет температуру вниз и показывает ощущаемую", async () => {
    const wrapper = await render({
      temperature: 5.9,
      temperatureApparent: 2.1,
    });

    expect(wrapper.text()).toContain("5");
    expect(wrapper.text()).toContain("Ощущается 2°");
  });

  it("не рисует разделитель перед единственным показателем", async () => {
    const wrapper = await render({ temperature: 5, humidity: 95 });

    expect(wrapper.text()).toContain("Влажность 95%");
    expect(wrapper.text()).not.toContain("·");
  });
});
