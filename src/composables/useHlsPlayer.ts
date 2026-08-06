import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import Hls from "hls.js";

const NATIVE_HLS_MIME = "application/vnd.apple.mpegurl";

/**
 * Подключает HLS-поток к <video>: через hls.js там, где он поддерживается,
 * и нативно в Safari/iOS. Пересоздаёт проигрыватель при смене src и
 * обязательно освобождает его при размонтировании — иначе hls.js продолжает
 * тянуть сегменты в фоне.
 *
 * Камеры периодически отваливаются (поток cam2 отдаёт `not found`), поэтому
 * фатальная ошибка выставляет `hasError`, а `retry()` подключает поток заново.
 */
export function useHlsPlayer(
  video: Ref<HTMLVideoElement | null>,
  src: Ref<string>,
) {
  let hls: Hls | null = null;
  /** Элемент, на который повешены слушатели нативного HLS. */
  let nativeElement: HTMLVideoElement | null = null;
  const hasError = ref(false);

  function playIfAutoplay(element: HTMLVideoElement): void {
    if (!element.autoplay) return;
    // play() отклоняется, если браузер запретил автозапуск — это не ошибка
    void element.play().catch(() => {});
  }

  function onLoadedMetadata(): void {
    if (nativeElement) playIfAutoplay(nativeElement);
  }

  /** Поток не поднялся: гасим проигрыватель и показываем постер с кнопкой. */
  function fail(): void {
    detach();
    hasError.value = true;
  }

  function detach(): void {
    hls?.destroy();
    hls = null;

    nativeElement?.removeEventListener("loadedmetadata", onLoadedMetadata);
    nativeElement?.removeEventListener("error", fail);
    nativeElement = null;
  }

  function attach(): void {
    const element = video.value;
    if (!element || !src.value) return;

    detach();
    hasError.value = false;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, () => playIfAutoplay(element));
      // Нефатальные ошибки hls.js разбирает сам (пропущенный сегмент, сбой
      // уровня), а фатальная означает, что без нового подключения поток
      // не оживёт — только тогда переходим в состояние ошибки
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      hls.loadSource(src.value);
      hls.attachMedia(element);
      return;
    }

    if (element.canPlayType(NATIVE_HLS_MIME)) {
      nativeElement = element;
      element.src = src.value;
      element.addEventListener("loadedmetadata", onLoadedMetadata, {
        once: true,
      });
      element.addEventListener("error", fail);
      // Повторная попытка ставит тот же src — без load() браузер может
      // не пойти за потоком заново
      element.load();
    }
  }

  // Подключение на onMounted, а не в watch с immediate: к этому моменту ref
  // уже заполнен, и порядок не зависит от планировщика эффектов
  onMounted(attach);
  watch(src, attach);
  onBeforeUnmount(detach);

  return { detach, retry: attach, hasError };
}
