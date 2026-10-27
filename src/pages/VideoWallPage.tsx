import HlsVideo from "@/components/HlsVideo";
import { cameras } from "@/data/cameras";
import { cameraGridCols } from "@/lib/cameraGrid";
import { cx } from "@/lib/cx";

export default function VideoWallPage() {
  return (
    <ul className={cx("grid mx-auto", cameraGridCols(cameras.length))}>
      {cameras.map((camera) => (
        <li className="relative" key={camera.title}>
          <HlsVideo
            src={camera.src}
            poster={camera.poster}
            muted
            controls
            playsInline
            autoPlay
          />
        </li>
      ))}
    </ul>
  );
}
