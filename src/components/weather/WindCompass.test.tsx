import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import WindCompass from "./WindCompass";

function renderCompass(windDirection: number, className?: string): HTMLElement {
  const { container } = render(
    <WindCompass windDirection={windDirection} className={className} />,
  );
  return container.firstElementChild as HTMLElement;
}

describe("WindCompass", () => {
  // Регрессия из Vue-версии: class/style/title висели на корневом <template>,
  // и компонент рендерился голым текстовым узлом «↑»
  it("рендерится настоящим элементом, а не текстовым узлом", () => {
    const element = renderCompass(0);

    expect(element.tagName).toBe("SPAN");
    expect(element.textContent).toBe("↑");
  });

  it("поворачивает стрелку на заданный угол", () => {
    expect(renderCompass(135).getAttribute("style")).toContain(
      "rotate(135deg)",
    );
  });

  it("принимает класс от родителя", () => {
    const element = renderCompass(0, "text-sm");

    expect(element.classList).toContain("text-sm");
    expect(element.classList).toContain("inline-block");
  });

  it.each([
    [0, "Северный"],
    [45, "Северо-восточный"],
    [90, "Восточный"],
    [180, "Южный"],
    [270, "Западный"],
    [315, "Северо-западный"],
    // Округление к ближайшему сектору и переход через 360
    [22, "Северный"],
    [23, "Северо-восточный"],
    [350, "Северный"],
    [360, "Северный"],
  ])("для %i° подписывает «%s»", (degrees, expected) => {
    expect(renderCompass(degrees).getAttribute("title")).toBe(expected);
  });
});
