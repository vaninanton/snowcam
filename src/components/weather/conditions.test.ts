import { describe, expect, it } from "vitest";
import dayjs from "./dayjs";
import { deriveConditions, PRECIPITATION_TYPE } from "./conditions";
import type { TimelineInterval, WeatherValues } from "@/types/tomorrow";

const NOW = dayjs("2026-01-15T10:00:00+05:00");

function hour(offsetHours: number, values: WeatherValues): TimelineInterval {
  return {
    startTime: NOW.add(offsetHours, "hour").toISOString(),
    values,
  };
}

function day(offsetDays: number, values: WeatherValues): TimelineInterval {
  return {
    startTime: NOW.add(offsetDays, "day").startOf("day").toISOString(),
    values,
  };
}

function derive(
  current: WeatherValues,
  past: TimelineInterval[] = [],
  daily: TimelineInterval[] = [],
) {
  return deriveConditions(
    { startTime: NOW.toISOString(), values: current },
    past,
    daily,
    NOW,
  );
}

describe("свежий снег", () => {
  it("суммирует миллиметры за сутки и переводит в сантиметры", () => {
    const past = [
      hour(-3, { snowAccumulation: 40 }),
      hour(-2, { snowAccumulation: 55 }),
      hour(-1, { snowAccumulation: 25 }),
    ];

    // 120 мм = 12 см
    expect(derive({}, past).freshSnowCm).toBe(12);
  });

  it("не спотыкается о пропуски в часах", () => {
    const past = [
      hour(-2, { snowAccumulation: 100 }),
      hour(-1, { temperature: -5 }),
    ];

    expect(derive({}, past).freshSnowCm).toBe(10);
  });

  it("схлопывает ноль в null, чтобы не показывать «0 см»", () => {
    expect(
      derive({}, [hour(-1, { snowAccumulation: 0 })]).freshSnowCm,
    ).toBeNull();
    expect(derive({}, []).freshSnowCm).toBeNull();
  });

  it("следы снега меньше половины сантиметра не показывает", () => {
    expect(
      derive({}, [hour(-1, { snowAccumulation: 3 })]).freshSnowCm,
    ).toBeNull();
  });
});

describe("ожидаемый снег", () => {
  it("суммирует трое ближайших суток, игнорируя вчера", () => {
    const daily = [
      day(-1, { snowAccumulationSum: 500 }), // вчера — не считаем
      day(0, { snowAccumulationSum: 50 }),
      day(1, { snowAccumulationSum: 70 }),
      day(2, { snowAccumulationSum: 30 }),
      day(3, { snowAccumulationSum: 900 }), // за горизонтом
    ];

    // 150 мм = 15 см
    expect(derive({}, [], daily).expectedSnowCm).toBe(15);
  });

  it("без снега в прогнозе отдаёт null", () => {
    expect(
      derive({}, [], [day(0, { snowAccumulationSum: 0 })]).expectedSnowCm,
    ).toBeNull();
  });
});

describe("определение зимы по данным", () => {
  it("лето: тепло, снега нет ни в прошлом, ни в прогнозе", () => {
    const summer = derive(
      { temperature: 12 },
      [],
      [
        day(0, {
          temperatureMax: 16,
          temperatureMin: 3,
          snowAccumulationSum: 0,
        }),
      ],
    );

    expect(summer.isWinter).toBe(false);
    expect(summer.freshSnowCm).toBeNull();
    expect(summer.expectedSnowCm).toBeNull();
  });

  it("зима по холодному дню даже без осадков", () => {
    expect(derive({}, [], [day(0, { temperatureMax: -4 })]).isWinter).toBe(
      true,
    );
  });

  it("зима по свежему снегу, даже если днём плюс", () => {
    const conditions = derive(
      {},
      [hour(-1, { snowAccumulation: 100 })],
      [day(0, { temperatureMax: 8 })],
    );

    expect(conditions.isWinter).toBe(true);
  });
});

describe("дождь на склоне", () => {
  const winterDay = [day(0, { temperatureMax: 2, temperatureMin: -6 })];

  it("предупреждает при дожде и плюсовой температуре зимой", () => {
    const conditions = derive(
      {
        temperature: 1.5,
        precipitationType: PRECIPITATION_TYPE.rain,
        rainIntensity: 0.4,
      },
      [],
      winterDay,
    );

    expect(conditions.isRainOnSnow).toBe(true);
  });

  it("молчит летом, когда дождь никому не мешает", () => {
    const conditions = derive(
      {
        temperature: 14,
        precipitationType: PRECIPITATION_TYPE.rain,
        rainIntensity: 2,
      },
      [],
      [day(0, { temperatureMax: 18, temperatureMin: 6 })],
    );

    expect(conditions.isWinter).toBe(false);
    expect(conditions.isRainOnSnow).toBe(false);
  });

  it("молчит, когда идёт снег, а не дождь", () => {
    const conditions = derive(
      { temperature: -2, precipitationType: PRECIPITATION_TYPE.snow },
      [],
      winterDay,
    );

    expect(conditions.isRainOnSnow).toBe(false);
  });
});

describe("условия катания", () => {
  it("поднимает тревогу по порывам от 15 м/с", () => {
    expect(derive({}, [], [day(0, { windGustMax: 14.9 })]).isWindAlert).toBe(
      false,
    );
    expect(derive({}, [], [day(0, { windGustMax: 15 })]).isWindAlert).toBe(
      true,
    );
  });

  it("считает молоком видимость меньше километра", () => {
    expect(derive({ visibility: 0.9 }).isLowVisibility).toBe(true);
    expect(derive({ visibility: 1.2 }).isLowVisibility).toBe(false);
    // null не должен притворяться нулём
    expect(derive({ visibility: null }).isLowVisibility).toBe(false);
  });

  it("замечает цикл заморозки-оттепели", () => {
    expect(
      derive({}, [], [day(0, { temperatureMin: -6, temperatureMax: 3 })])
        .isFreezeThaw,
    ).toBe(true);
    expect(
      derive({}, [], [day(0, { temperatureMin: -9, temperatureMax: -2 })])
        .isFreezeThaw,
    ).toBe(false);
  });

  it("берёт агрегаты именно за сегодня, а не за вчера", () => {
    const daily = [
      day(-1, { windGustMax: 30, uvIndexMax: 1, temperatureMax: -20 }),
      day(0, { windGustMax: 5, uvIndexMax: 7, temperatureMax: -1 }),
    ];
    const conditions = derive({}, [], daily);

    expect(conditions.windGustMaxMs).toBe(5);
    expect(conditions.uvIndexMax).toBe(7);
    expect(conditions.isWindAlert).toBe(false);
  });

  it("без суточного интервала не выдумывает значений", () => {
    const conditions = derive({});

    expect(conditions.windGustMaxMs).toBeNull();
    expect(conditions.uvIndexMax).toBeNull();
    expect(conditions.tempMin).toBeNull();
    expect(conditions.isFreezeThaw).toBe(false);
  });
});
