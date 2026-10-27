import { useCallback, useEffect, useState, type RefObject } from "react";
import Hls from "hls.js";

const NATIVE_HLS_MIME = "application/vnd.apple.mpegurl";

function playIfAutoplay(element: HTMLVideoElement): void {
  if (!element.autoplay) return;
  // play() отклоняется, если браузер запретил автозапуск — это не ошибка
  void element.play().catch(() => {});
}

/** Подключает поток через hls.js. Возвращает функцию отключения. */
function attachHls(
  element: HTMLVideoElement,
  src: string,
  onFatal: () => void,
): () => void {
  let hls: Hls | null = new Hls();
  const destroy = () => {
    hls?.destroy();
    hls = null;
  };

  hls.on(Hls.Events.MANIFEST_PARSED, () => playIfAutoplay(element));
  // Нефатальные ошибки hls.js разбирает сам (пропущенный сегмент, сбой
  // уровня), а фатальная означает, что без нового подключения поток
  // не оживёт — только тогда переходим в состояние ошибки
  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;
    destroy();
    onFatal();
  });
  hls.loadSource(src);
  hls.attachMedia(element);
  return destroy;
}

/** Подключает поток нативным HLS (Safari/iOS). Возвращает функцию отключения. */
function attachNative(
  element: HTMLVideoElement,
  src: string,
  onError: () => void,
): () => void {
  const onLoadedMetadata = () => playIfAutoplay(element);
  const onFail = () => {
    detach();
    onError();
  };
  function detach(): void {
    element.removeEventListener("loadedmetadata", onLoadedMetadata);
    element.removeEventListener("error", onFail);
  }

  element.src = src;
  element.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
  element.addEventListener("error", onFail);
  // Повторная попытка ставит тот же src — без load() браузер может
  // не пойти за потоком заново
  element.load();
  return detach;
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

    /** Поток не поднялся: показываем постер с кнопкой повтора. */
    const fail = () => setFailedConnection(connection);

    if (Hls.isSupported()) return attachHls(element, src, fail);
    if (element.canPlayType(NATIVE_HLS_MIME)) {
      return attachNative(element, src, fail);
    }
  }, [video, src, connection]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { hasError: failedConnection === connection, retry };
}
