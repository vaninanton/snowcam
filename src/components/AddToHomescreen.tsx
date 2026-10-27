import { useEffect, useState } from "react";

/** Имя куки сохранено с Vue-плагина, чтобы не показать баннер повторно. */
export const SHOWN_COOKIE = "addToHomescreenCalled";
const SHOWN_COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60;

/** Событие Chromium, которого нет в lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function wasShown(): boolean {
  return document.cookie
    .split("; ")
    .some((pair) => pair.startsWith(`${SHOWN_COOKIE}=`));
}

/** iPadOS представляется десктопным Safari, отличает его только тачскрин. */
function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

/**
 * Разовое предложение установить приложение на домашний экран. Там, где
 * браузер даёт beforeinstallprompt (Chromium), кнопка вызывает системный
 * диалог; в остальных — показывает, как установить вручную.
 */
export default function AddToHomescreen() {
  const [visible, setVisible] = useState(() => !isStandalone() && !wasShown());
  const [showHelp, setShowHelp] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!visible) return;
    // Баннер показывается один раз, даже если его не закрыли
    document.cookie = `${SHOWN_COOKIE}=true; Max-Age=${SHOWN_COOKIE_MAX_AGE_S}; Path=/`;
  }, [visible]);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event): void {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!visible) return null;

  function install(): void {
    if (installPrompt) {
      void installPrompt.prompt();
      setVisible(false);
    } else {
      setShowHelp(true);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Установка приложения"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 bg-slate-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-slate-300 shadow-lg"
    >
      <div className="mx-auto flex max-w-2xl items-start gap-4">
        <img
          src="/android-chrome-512x512.png"
          alt=""
          className="size-12 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100">SnowCam</p>
          {showHelp ? (
            isIOS() ? (
              <ol className="mt-1 list-decimal pl-4 text-sm">
                <li>Откройте меню «Поделиться»</li>
                <li>Нажмите «На экран „Домой“»</li>
              </ol>
            ) : (
              <p className="mt-1 text-sm">
                Откройте меню браузера и выберите «Установить приложение» или
                «Добавить на главный экран».
              </p>
            )
          ) : (
            <>
              <p className="mt-1 text-sm">
                Можно установить как приложение на домашний экран
              </p>
              <button
                type="button"
                className="mt-3 rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
                onClick={install}
              >
                Установить
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          className="text-xl leading-none text-slate-500 transition-colors hover:text-slate-300"
          aria-label="Закрыть"
          onClick={() => setVisible(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
