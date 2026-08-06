import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import HlsVideo from "./HlsVideo.vue";

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
  handlers.get("hlsError")?.("hlsError", { fatal: true });
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
    const wrapper = mount(HlsVideo, { props: PROPS });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["relative", "aspect-video", "w-full"]),
    );
    expect(wrapper.get("video").classes()).toEqual(
      expect.arrayContaining(["h-full", "w-full", "object-cover"]),
    );
  });

  it("пробрасывает poster и атрибуты плеера от родителя", () => {
    const wrapper = mount(HlsVideo, {
      props: PROPS,
      attrs: { muted: "", controls: "", playsinline: "" },
    });
    const video = wrapper.get("video");

    expect(video.attributes("poster")).toBe("/p.jpg");
    expect(video.attributes()).toHaveProperty("controls");
    expect(video.attributes()).toHaveProperty("playsinline");
  });

  it("подключает поток через hls.js", () => {
    mount(HlsVideo, { props: PROPS });

    expect(loadSource).toHaveBeenCalledWith(PROPS.src);
    expect(attachMedia).toHaveBeenCalledOnce();
  });

  // Раньше экземпляр Hls не уничтожался и продолжал тянуть сегменты в фоне
  it("освобождает проигрыватель при размонтировании", () => {
    const wrapper = mount(HlsVideo, { props: PROPS });
    destroy.mockClear();

    wrapper.unmount();

    expect(destroy).toHaveBeenCalled();
  });

  it("пересоздаёт проигрыватель при смене src", async () => {
    const wrapper = mount(HlsVideo, { props: PROPS });
    loadSource.mockClear();

    await wrapper.setProps({ src: "https://example.test/other.m3u8" });

    expect(loadSource).toHaveBeenCalledWith("https://example.test/other.m3u8");
  });

  it("в обычном состоянии не показывает заглушку", () => {
    const wrapper = mount(HlsVideo, { props: PROPS });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.get("video").classes()).not.toContain("grayscale");
  });

  it("на фатальной ошибке гасит кадр и показывает кнопку повтора", async () => {
    const wrapper = mount(HlsVideo, { props: PROPS });

    emitFatalError();
    await wrapper.vm.$nextTick();

    expect(destroy).toHaveBeenCalled();
    expect(wrapper.get("video").classes()).toContain("grayscale");
    expect(wrapper.get("button").attributes("aria-label")).toBe(
      "Повторить загрузку",
    );
  });

  it("нефатальную ошибку hls.js разбирает сам — заглушка не появляется", async () => {
    const wrapper = mount(HlsVideo, { props: PROPS });

    handlers.get("hlsError")?.("hlsError", { fatal: false });
    await wrapper.vm.$nextTick();

    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("кнопка повтора подключает поток заново и убирает заглушку", async () => {
    const wrapper = mount(HlsVideo, { props: PROPS });

    emitFatalError();
    await wrapper.vm.$nextTick();
    loadSource.mockClear();

    await wrapper.get("button").trigger("click");

    expect(loadSource).toHaveBeenCalledWith(PROPS.src);
    expect(wrapper.find("button").exists()).toBe(false);
  });
});
