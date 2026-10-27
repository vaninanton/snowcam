import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import HlsVideo from "./HlsVideo";

const destroy = vi.fn();
const loadSource = vi.fn();
const attachMedia = vi.fn();
const handlers = new Map<string, (event: string, data: unknown) => void>();

vi.mock("hls.js", () => {
  class FakeHls {
    static Events = { MANIFEST_PARSED: "hlsManifestParsed", ERROR: "hlsError" };
    static isSupported = () => true;
    on = (event: string, handler: (event: string, data: unknown) => void) => {
      handlers.set(event, handler);
    };
    loadSource = loadSource;
    attachMedia = attachMedia;
    destroy = destroy;
  }
  return { default: FakeHls };
});

const PROPS = { src: "https://example.test/stream.m3u8", poster: "/p.jpg" };

/** Роняет поток так же, как это делает hls.js на недоступной камере. */
function emitFatalError(): void {
  act(() => handlers.get("hlsError")?.("hlsError", { fatal: true }));
}

function videoOf(container: HTMLElement): HTMLVideoElement {
  return container.querySelector("video")!;
}

// Моки объявлены на уровне модуля (иначе их не видно из фабрики vi.mock),
// поэтому вызовы копятся между кейсами — чистим вручную
beforeEach(() => {
  destroy.mockClear();
  loadSource.mockClear();
  attachMedia.mockClear();
  handlers.clear();
});

describe("HlsVideo", () => {
  it("резервирует бокс 16:9 на всю ширину, чтобы вёрстка не прыгала", () => {
    const { container } = render(<HlsVideo {...PROPS} />);
    const wrapper = container.firstElementChild!;

    expect([...wrapper.classList]).toEqual(
      expect.arrayContaining(["relative", "aspect-video", "w-full"]),
    );
    expect([...videoOf(container).classList]).toEqual(
      expect.arrayContaining(["h-full", "w-full", "object-cover"]),
    );
  });

  it("пробрасывает poster и атрибуты плеера на <video>", () => {
    const { container } = render(
      <HlsVideo {...PROPS} muted controls playsInline />,
    );
    const video = videoOf(container);

    expect(video.getAttribute("poster")).toBe("/p.jpg");
    expect(video.hasAttribute("controls")).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    // React выставляет muted свойством, а не атрибутом
    expect(video.muted).toBe(true);
  });

  it("подключает поток через hls.js", () => {
    render(<HlsVideo {...PROPS} />);

    expect(loadSource).toHaveBeenLastCalledWith(PROPS.src);
    expect(attachMedia).toHaveBeenCalled();
  });

  // Раньше экземпляр Hls не уничтожался и продолжал тянуть сегменты в фоне
  it("освобождает проигрыватель при размонтировании", () => {
    const { unmount } = render(<HlsVideo {...PROPS} />);
    destroy.mockClear();

    unmount();

    expect(destroy).toHaveBeenCalled();
  });

  it("пересоздаёт проигрыватель при смене src", () => {
    const { rerender } = render(<HlsVideo {...PROPS} />);
    loadSource.mockClear();
    destroy.mockClear();

    rerender(<HlsVideo {...PROPS} src="https://example.test/other.m3u8" />);

    expect(destroy).toHaveBeenCalled();
    expect(loadSource).toHaveBeenCalledWith("https://example.test/other.m3u8");
  });

  it("в обычном состоянии не показывает заглушку", () => {
    const { container } = render(<HlsVideo {...PROPS} />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(videoOf(container).classList).not.toContain("grayscale");
  });

  it("на фатальной ошибке гасит кадр и показывает кнопку повтора", () => {
    const { container } = render(<HlsVideo {...PROPS} />);
    destroy.mockClear();

    emitFatalError();

    expect(destroy).toHaveBeenCalled();
    expect(videoOf(container).classList).toContain("grayscale");
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "Повторить загрузку",
    );
  });

  it("нефатальную ошибку hls.js разбирает сам — заглушка не появляется", () => {
    render(<HlsVideo {...PROPS} />);

    act(() => handlers.get("hlsError")?.("hlsError", { fatal: false }));

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("кнопка повтора подключает поток заново и убирает заглушку", () => {
    render(<HlsVideo {...PROPS} />);

    emitFatalError();
    loadSource.mockClear();

    fireEvent.click(screen.getByRole("button"));

    expect(loadSource).toHaveBeenCalledWith(PROPS.src);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
