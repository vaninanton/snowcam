import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import TimelineItem from "./TimelineItem";
import type { WeatherValues } from "@/types/tomorrow";

function textOf(values: WeatherValues): string {
  const timeline = { startTime: "2026-08-05T08:00:00Z", values };
  return render(<TimelineItem timeline={timeline} />).container.textContent!;
}

describe("TimelineItem", () => {
  it("округляет температуру вниз и показывает ощущаемую, если она другая", () => {
    expect(textOf({ temperature: -3.2, temperatureApparent: -7.5 })).toContain(
      "-4° (-8°)",
    );
  });

  it("не дублирует ощущаемую, если она совпадает", () => {
    expect(
      textOf({ temperature: 2.4, temperatureApparent: 2.9 }),
    ).not.toContain("(");
  });

  // Регрессия: явный null от API рендерился как «0°»
  it("не выдаёт null за ноль", () => {
    const text = textOf({
      temperature: null as unknown as number,
      temperatureApparent: null as unknown as number,
    });

    expect(text).toContain("-°");
    expect(text).not.toContain("0°");
  });
});
