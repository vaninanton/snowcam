import { useLayoutEffect, useRef } from "react";
import { AddToHomescreen } from "snowcam";
import appIcon from "../../public/android-chrome-192x192.png";

// Баннер показывается один раз и помечает это кукой — сбрасываем её,
// чтобы карточка показывала его при каждом открытии
document.cookie = "addToHomescreenCalled=; Max-Age=0; Path=/";

/**
 * Баннер берёт иконку по абсолютному пути /android-chrome-512x512.png из
 * public/ приложения. В карточке такого пути нет — подставляем ту же иконку
 * из репозитория, как её отдал бы хостинг приложения.
 */
function WithAppIcon({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current
      ?.querySelectorAll<HTMLImageElement>(
        'img[src="/android-chrome-512x512.png"]',
      )
      .forEach((img) => {
        img.src = appIcon;
      });
  }, []);
  return <div ref={ref}>{children}</div>;
}

/**
 * Баннер установки внизу экрана. transform на обёртке делает её содержащим
 * блоком для fixed-баннера: он прижимается к низу карточки, а не окна.
 */
export const Banner = () => (
  <div
    className="h-[200px] bg-slate-900 text-slate-400"
    style={{ transform: "translateZ(0)" }}
  >
    <WithAppIcon>
      <AddToHomescreen />
    </WithAppIcon>
  </div>
);
