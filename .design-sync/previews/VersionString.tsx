import { VersionString } from "snowcam";

/** Строка версии в подвале страницы. */
export const Footer = () => (
  <div className="w-[480px] bg-slate-900 pt-4 text-slate-400">
    <VersionString onClick={() => undefined} />
  </div>
);
