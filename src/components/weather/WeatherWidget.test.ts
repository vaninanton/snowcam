import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import WeatherWidget from "./WeatherWidget.vue";
import { WEATHER_CACHE_KEY } from "@/composables/useWeather";
import type { WeatherValues } from "@/types/tomorrow";

interface Fixture {
  /** Часы в прошлом: из них считается свежий снег. */
  past?: WeatherValues[];
  /** Агрегаты за сегодня. */
  today?: WeatherValues;
}

function seedCache(values: WeatherValues, fixture: Fixture = {}): void {
  const hourAgo = (offset: number) =>
    new Date(Date.now() - offset * 3600_000).toISOString();

  localStorage.setItem(
    WEATHER_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: {
        data: {
          timelines: [
            {
              timestep: "current",
              intervals: [{ startTime: new Date().toISOString(), values }],
            },
            {
              timestep: "1h",
              intervals: (fixture.past ?? []).map((v, i) => ({
                startTime: hourAgo(i + 1),
                values: v,
              })),
            },
            {
              timestep: "1d",
              intervals: fixture.today
                ? [
                    {
                      startTime: new Date().toISOString(),
                      values: fixture.today,
                    },
                  ]
                : [],
            },
          ],
        },
      },
    }),
  );
}

async function render(values: WeatherValues, fixture: Fixture = {}) {
  seedCache(values, fixture);
  const wrapper = mount(WeatherWidget);
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv("VITE_TOMORROW_API_KEY", "TEST_KEY");
});

describe("WeatherWidget", () => {
  // Регрессия: API присылает не только undefined, но и явный null, а
  // Math.round(null) === 0 — так в виджете появлялся выдуманный «Снег 0 см».
  // Само поле snowDepth больше не запрашивается (оно всегда null вне США),
  // но nullable-поля остались: visibility, cloudBase и суточные агрегаты
  it("не выдаёт null за ноль", async () => {
    const wrapper = await render({
      temperature: 5.4,
      windSpeed: 1.2,
      visibility: null,
    });

    expect(wrapper.text()).not.toContain("Видимость");
    expect(wrapper.text()).not.toContain("0 км");
  });

  it("не показывает снег, когда его нет", async () => {
    const wrapper = await render({ temperature: 5.4, windSpeed: 1.2 });

    expect(wrapper.text()).not.toContain("Снег");
    expect(wrapper.text()).not.toContain("см");
  });

  it("показывает свежий снег за сутки в сантиметрах", async () => {
    const wrapper = await render(
      { temperature: -3 },
      { past: [{ snowAccumulation: 70 }, { snowAccumulation: 50 }] },
    );

    // 120 мм = 12 см
    expect(wrapper.text()).toContain("Свежего 12 см за сутки");
  });

  it("предупреждает о ветре, при котором встают подъёмники", async () => {
    const wrapper = await render(
      { temperature: -3 },
      { today: { windGustMax: 18, temperatureMax: -1 } },
    );

    expect(wrapper.text()).toContain("18 м/с");
    expect(wrapper.text()).toContain("подъёмники");
  });

  it("летом не показывает ни снежный блок, ни предупреждения о склоне", async () => {
    const wrapper = await render(
      { temperature: 14, precipitationType: 1, rainIntensity: 2 },
      { today: { temperatureMax: 18, temperatureMin: 6, windGustMax: 4 } },
    );

    expect(wrapper.text()).not.toContain("Свежего");
    expect(wrapper.text()).not.toContain("Ожидается");
    expect(wrapper.text()).not.toContain("Дождь на склоне");
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
