import { lazy, Suspense, useRef } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import type { Camera } from "@/types/camera";

// hls.js весит ~180 КБ gzip и нужен только плееру, поэтому HlsVideo грузится
// отдельным чанком и только для камер, до которых долистали. До этого на месте
// плеера постер в том же боксе 16:9, что и у HlsVideo, — вёрстка не прыгает.
const HlsVideo = lazy(() => import("./HlsVideo"));

function Poster({ src }: { src: string }) {
  return (
    <div className="relative aspect-video w-full">
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

export default function CameraVideo({ camera }: { camera: Camera }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(ref);
  const poster = <Poster src={camera.poster} />;

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={poster}>
          <HlsVideo
            src={camera.src}
            poster={camera.poster}
            muted
            controls
            playsInline
            autoPlay
          />
        </Suspense>
      ) : (
        poster
      )}
    </div>
  );
}
