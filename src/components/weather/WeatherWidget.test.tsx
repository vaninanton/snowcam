import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import WeatherWidget from "./WeatherWidget";
import { WEATHER_CACHE_KEY } from "@/hooks/useWeather";
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

/** Текст виджета. Со свежим кэшем он готов уже на первом рендере. */
function renderText(values: WeatherValues, fixture: Fixture = {}): string {
  seedCache(values, fixture);
  return render(<WeatherWidget />).container.textContent ?? "";
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
  it("не выдаёт null за ноль", () => {
    const text = renderText({
      temperature: 5.4,
      windSpeed: 1.2,
      visibility: null,
    });

    expect(text).not.toContain("Видимость");
    expect(text).not.toContain("0 км");
  });

  it("не показывает снег, когда его нет", () => {
    const text = renderText({ temperature: 5.4, windSpeed: 1.2 });

    expect(text).not.toContain("Снег");
    expect(text).not.toContain("см");
  });

  it("показывает свежий снег за сутки в сантиметрах", () => {
    const text = renderText(
      { temperature: -3 },
      { past: [{ snowAccumulation: 70 }, { snowAccumulation: 50 }] },
    );

    // 120 мм = 12 см
    expect(text).toContain("Свежего 12 см за сутки");
  });

  it("предупреждает о ветре, при котором встают подъёмники", () => {
    const text = renderText(
      { temperature: -3 },
      { today: { windGustMax: 18, temperatureMax: -1 } },
    );

    expect(text).toContain("18 м/с");
    expect(text).toContain("подъёмники");
  });

  it("летом не показывает ни снежный блок, ни предупреждения о склоне", () => {
    const text = renderText(
      { temperature: 14, precipitationType: 1, rainIntensity: 2 },
      { today: { temperatureMax: 18, temperatureMin: 6, windGustMax: 4 } },
    );

    expect(text).not.toContain("Свежего");
    expect(text).not.toContain("Ожидается");
    expect(text).not.toContain("Дождь на склоне");
  });

  it("округляет температуру вниз и показывает ощущаемую", () => {
    const text = renderText({
      temperature: 5.9,
      temperatureApparent: 2.1,
    });

    expect(text).toContain("5");
    expect(text).toContain("Ощущается 2°");
  });

  it("не рисует разделитель перед единственным показателем", () => {
    const text = renderText({ temperature: 5, humidity: 95 });

    expect(text).toContain("Влажность 95%");
    expect(text).not.toContain("·");
  });

  // Раньше стрелка цеплялась к первому пункту строки, каким бы он ни был
  it("не рисует компас без пункта про ветер", () => {
    seedCache({ temperature: 5, windDirection: 90, visibility: 10 });
    const { container } = render(<WeatherWidget />);

    expect(container.textContent).toContain("Видимость 10 км");
    expect(container.querySelector('[title="Восточный"]')).toBeNull();
  });

  it("рисует компас рядом с ветром", () => {
    seedCache({ temperature: 5, windSpeed: 3, windDirection: 90 });
    const { container } = render(<WeatherWidget />);

    expect(container.querySelector('[title="Восточный"]')).not.toBeNull();
  });
});
