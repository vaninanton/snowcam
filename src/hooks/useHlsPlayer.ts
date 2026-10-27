import { useCallback, useEffect, useState, type RefObject } from "react";
import Hls from "hls.js";

const NATIVE_HLS_MIME = "application/vnd.apple.mpegurl";

function playIfAutoplay(element: HTMLVideoElement): void {
  if (!element.autoplay) return;
  // play() отклоняется, если браузер запретил автозапуск — это не ошибка
  void element.play().catch(() => {});
}

/**
 * Подключает HLS-поток к <video>: через hls.js там, где он поддерживается,
 * и нативно в Safari/iOS. Пересоздаёт проигрыватель при смене src и
 * обязательно освобождает его при размонтировании — иначе hls.js продолжает
 * тянуть сегменты в фоне.
 *
 * Камеры периодически отваливаются (так умер поток cam2), поэтому
 * фатальная ошибка выставляет `hasError`, а `retry()` подключает поток заново.
 */
export function useHlsPlayer(
  video: RefObject<HTMLVideoElement | null>,
  src: string,
) {
  const [attempt, setAttempt] = useState(0);
  // Ошибка привязана к конкретному подключению (src + номер попытки): смена
  // потока или повтор дают новый ключ, и заглушка пропадает без отдельного
  // сброса состояния
  const connection = `${attempt}:${src}`;
  const [failedConnection, setFailedConnection] = useState<string | null>(null);

  useEffect(() => {
    const element = video.current;
    if (!element || !src) return;

    /** Поток не поднялся: гасим проигрыватель и показываем постер с кнопкой. */
    function fail(): void {
      detach();
      setFailedConnection(connection);
    }

    let hls: Hls | null = null;
    /** Элемент, на который повешены слушатели нативного HLS. */
    let nativeElement: HTMLVideoElement | null = null;

    function onLoadedMetadata(): void {
      if (nativeElement) playIfAutoplay(nativeElement);
    }

    function detach(): void {
      hls?.destroy();
      hls = null;

      nativeElement?.removeEventListener("loadedmetadata", onLoadedMetadata);
      nativeElement?.removeEventListener("error", fail);
      nativeElement = null;
    }

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, () => playIfAutoplay(element));
      // Нефатальные ошибки hls.js разбирает сам (пропущенный сегмент, сбой
      // уровня), а фатальная означает, что без нового подключения поток
      // не оживёт — только тогда переходим в состояние ошибки
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      hls.loadSource(src);
      hls.attachMedia(element);
    } else if (element.canPlayType(NATIVE_HLS_MIME)) {
      nativeElement = element;
      element.setAttribute("src", src);
      element.addEventListener("loadedmetadata", onLoadedMetadata, {
        once: true,
      });
      element.addEventListener("error", fail);
      // Повторная попытка ставит тот же src — без load() браузер может
      // не пойти за потоком заново
      element.load();
    }

    return detach;
  }, [video, src, connection]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { hasError: failedConnection === connection, retry };
}
