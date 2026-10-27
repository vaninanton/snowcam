import HlsVideo from "@/components/HlsVideo";
import { cameras } from "@/data/cameras";

const visibleCameras = cameras.filter((camera) => camera.src);

export default function VideoWallPage() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto">
      {visibleCameras.map((camera) => (
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
