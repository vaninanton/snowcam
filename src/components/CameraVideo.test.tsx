import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import CameraVideo from "./CameraVideo";
import type { Camera } from "@/types/camera";

const CAMERA: Camera = {
  place: "Шымбулак",
  title: "Тестовая",
  description: "",
  elevation: 2000,
  src: "https://example.test/stream.m3u8",
  poster: "/previews/test.webp",
};

/** IntersectionObserver, которым тест управляет вручную. */
const observers: FakeObserver[] = [];

class FakeObserver {
  disconnected = false;
  private readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.push(this);
  }
  observe(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  /** Сообщает, что элемент подошёл (или не подошёл) к видимой области. */
  fire(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CameraVideo", () => {
  it("вне видимой области показывает только постер", () => {
    const { container } = render(<CameraVideo camera={CAMERA} />);

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      CAMERA.poster,
    );
    expect(container.querySelector("video")).toBeNull();
  });

  it("не грузит плеер, пока элемент не пересёк границу", () => {
    const { container } = render(<CameraVideo camera={CAMERA} />);

    act(() => observers[0]!.fire(false));

    expect(container.querySelector("video")).toBeNull();
  });

  it("подключает плеер, когда камера подходит к экрану, и перестаёт следить", async () => {
    const { container } = render(<CameraVideo camera={CAMERA} />);
    const observer = observers[0]!;

    await act(async () => observer.fire(true));
    // Чанк HlsVideo грузится асинхронно — ждём, пока Suspense его покажет
    await vi.waitFor(() => {
      expect(container.querySelector("video")).not.toBeNull();
    });

    expect(observer.disconnected).toBe(true);
    expect(container.querySelector("video")?.getAttribute("poster")).toBe(
      CAMERA.poster,
    );
  });

  it("без IntersectionObserver грузит плеер сразу", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const { container } = render(<CameraVideo camera={CAMERA} />);

    await vi.waitFor(() => {
      expect(container.querySelector("video")).not.toBeNull();
    });
  });
});
