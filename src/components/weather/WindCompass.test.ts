import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import WindCompass from "./WindCompass.vue";

describe("WindCompass", () => {
  // Регрессия: раньше class/style/title висели на корневом <template>, из-за
  // чего Vue их отбрасывал и компонент рендерился голым текстовым узлом «↑»
  it("рендерится настоящим элементом, а не текстовым узлом", () => {
    const wrapper = mount(WindCompass, { props: { windDirection: 0 } });

    expect(wrapper.element.nodeType).toBe(Node.ELEMENT_NODE);
    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.text()).toBe("↑");
  });

  it("поворачивает стрелку на заданный угол", () => {
    const wrapper = mount(WindCompass, { props: { windDirection: 135 } });

    expect(wrapper.attributes("style")).toContain("rotate(135deg)");
  });

  it("принимает класс от родителя", () => {
    const wrapper = mount(WindCompass, {
      props: { windDirection: 0 },
      attrs: { class: "text-sm" },
    });

    expect(wrapper.classes()).toContain("text-sm");
    expect(wrapper.classes()).toContain("inline-block");
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
    const wrapper = mount(WindCompass, {
      props: { windDirection: degrees },
    });

    expect(wrapper.attributes("title")).toBe(expected);
  });
});
