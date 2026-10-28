import { HlsVideo } from "snowcam";
import glacierPoster from "../../public/previews/892c6cefe6ea6b6bdf083233c8fd37b6.webp";
import liftPoster from "../../public/previews/d5e9db37c506562c992e108f46896797.webp";

/** Живой поток камеры «Ледник Богдановича»; до первого кадра виден постер. */
export const Live = () => (
  <div className="w-[480px] bg-slate-900 text-slate-400">
    <HlsVideo
      src="https://ipcam.kz/cam6/index.m3u8"
      poster={glacierPoster}
      muted
      controls
      playsInline
    />
  </div>
);

/** Поток недоступен: серый кадр и кнопка повтора. */
export const Unavailable = () => (
  <div className="w-[480px] bg-slate-900 text-slate-400">
    <HlsVideo
      src="https://ds-preview.invalid/cam2/index.m3u8"
      poster={liftPoster}
      muted
      playsInline
    />
  </div>
);
