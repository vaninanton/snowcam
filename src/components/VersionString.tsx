/** VITE_BUILD_VERSION подставляется в CI как github.sha. */
function buildVersion(): string {
  const sha = import.meta.env.VITE_BUILD_VERSION;
  return sha ? sha.slice(0, 7) : "develop";
}

export default function VersionString({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="bottom-0 right-0 text-right text-xs pr-4 pb-2 cursor-pointer hover:underline"
      onClick={onClick}
    >
      ver: {buildVersion()}
    </div>
  );
}
