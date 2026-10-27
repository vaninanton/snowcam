import { useRef, type VideoHTMLAttributes } from "react";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { cx } from "@/lib/cx";

// Размеры задаются здесь, а не в местах использования. Бокс 16:9 на всю ширину
// держит внешний <div>: без w-full ширину <video> определяет разрешение постера
// (720px постер -> видео 720px в ячейке 835px), а без aspect-video высота до
// загрузки потока берётся из постера и меняется на размеры видео — отсюда
// прыжки страницы. С этой парой вёрстка не зависит ни от разрешения постера,
// ни от момента загрузки, а оверлей ошибки ложится ровно на кадр.
//
// Остальные атрибуты (poster, muted, controls, autoPlay) уходят на <video>,
// а не на обёртку. src на сам <video> не ставится: поток подключает
// useHlsPlayer.
type HlsVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  src: string;
};

export default function HlsVideo({ src, className, ...attrs }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { hasError, retry } = useHlsPlayer(videoRef, src);

  return (
    <div className="relative aspect-video w-full">
      <video
        ref={videoRef}
        className={cx(
          "h-full w-full object-cover",
          hasError && "grayscale",
          className,
        )}
        {...attrs}
      />
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/70 text-slate-300">
          <button
            type="button"
            className="flex size-14 items-center justify-center rounded-full border border-slate-500 bg-slate-800/70 text-slate-200 transition-colors hover:border-sky-500 hover:text-sky-400"
            aria-label="Повторить загрузку"
            title="Повторить загрузку"
            onClick={retry}
          >
            <svg
              className="size-7"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
          <span className="text-sm">Камера недоступна</span>
        </div>
      )}
    </div>
  );
}
