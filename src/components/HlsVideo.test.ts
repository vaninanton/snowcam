import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import HlsVideo from "./HlsVideo.vue";

const destroy = vi.fn();
const loadSource = vi.fn();
const attachMedia = vi.fn();

vi.mock("hls.js", () => {
  class FakeHls {
    static Events = { MANIFEST_PARSED: "hlsManifestParsed" };
    static isSupported = () => true;
    on = vi.fn();
    loadSource = loadSource;
    attachMedia = attachMedia;
    destroy = destroy;
  }
  return { default: FakeHls };
});

const PROPS = { src: "https://example.test/stream.m3u8", poster: "/p.jpg" };

// Моки объявлены на уровне модуля (иначе их не видно из фабрики vi.mock),
// поэтому вызовы копятся между кейсами — чистим вручную
beforeEach(() => {
  destroy.mockClear();
  loadSource.mockClear();
  attachMedia.mockClear();
});

describe("HlsVideo", () => {
  it("резервирует бокс 16:9 на всю ширину, чтобы вёрстка не прыгала", () => {
    const wrapper = mount(HlsVideo, { props: PROPS });

    expect(wrapper.element.tagName).toBe("VIDEO");
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["aspect-video", "w-full", "object-cover"]),
    );
  });

  it("пробрасывает poster и атрибуты плеера от родителя", () => {
    const wrapper = mount(HlsVideo, {
      props: PROPS,
      attrs: { muted: "", controls: "", playsinline: "" },
    });

    expect(wrapper.attributes("poster")).toBe("/p.jpg");
    expect(wrapper.attributes()).toHaveProperty("controls");
    expect(wrapper.attributes()).toHaveProperty("playsinline");
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
});
