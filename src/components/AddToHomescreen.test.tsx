import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AddToHomescreen, { SHOWN_COOKIE } from "./AddToHomescreen";

function clearShownCookie(): void {
  // Дата в прошлом, а не Max-Age=0: в happy-dom кука с истечением «сейчас»
  // живёт до конца текущей миллисекунды, и следующий тест её ещё видит
  document.cookie = `${SHOWN_COOKIE}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
}

beforeEach(clearShownCookie);

describe("AddToHomescreen", () => {
  it("показывается при первом визите и запоминает это в куке", () => {
    render(<AddToHomescreen />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.cookie).toContain(`${SHOWN_COOKIE}=true`);
  });

  it("не показывается повторно", () => {
    document.cookie = `${SHOWN_COOKIE}=true; Path=/`;

    render(<AddToHomescreen />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("закрывается крестиком", () => {
    render(<AddToHomescreen />);

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("вызывает системный диалог установки, если браузер его дал", () => {
    render(<AddToHomescreen />);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt: vi.fn(() => Promise.resolve()),
    });
    act(() => {
      window.dispatchEvent(event);
    });

    fireEvent.click(screen.getByRole("button", { name: "Установить" }));

    expect(event.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("без системного диалога объясняет, как установить вручную", () => {
    render(<AddToHomescreen />);

    fireEvent.click(screen.getByRole("button", { name: "Установить" }));

    expect(screen.getByRole("dialog").textContent).toContain(
      "Добавить на главный экран",
    );
  });
});
