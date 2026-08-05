import { onBeforeUnmount, onMounted, watch, type Ref } from "vue";
import Hls from "hls.js";

const NATIVE_HLS_MIME = "application/vnd.apple.mpegurl";

/**
 * Подключает HLS-поток к <video>: через hls.js там, где он поддерживается,
 * и нативно в Safari/iOS. Пересоздаёт проигрыватель при смене src и
 * обязательно освобождает его при размонтировании — иначе hls.js продолжает
 * тянуть сегменты в фоне.
 */
export function useHlsPlayer(
  video: Ref<HTMLVideoElement | null>,
  src: Ref<string>,
) {
  let hls: Hls | null = null;

  function playIfAutoplay(element: HTMLVideoElement): void {
    if (!element.autoplay) return;
    // play() отклоняется, если браузер запретил автозапуск — это не ошибка
    void element.play().catch(() => {});
  }

  function detach(): void {
    hls?.destroy();
    hls = null;
  }

  function attach(): void {
    const element = video.value;
    if (!element || !src.value) return;

    detach();

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, () => playIfAutoplay(element));
      hls.loadSource(src.value);
      hls.attachMedia(element);
      return;
    }

    if (element.canPlayType(NATIVE_HLS_MIME)) {
      element.src = src.value;
      element.addEventListener(
        "loadedmetadata",
        () => playIfAutoplay(element),
        {
          once: true,
        },
      );
    }
  }

  // Подключение на onMounted, а не в watch с immediate: к этому моменту ref
  // уже заполнен, и порядок не зависит от планировщика эффектов
  onMounted(attach);
  watch(src, attach);
  onBeforeUnmount(detach);

  return { detach };
}
