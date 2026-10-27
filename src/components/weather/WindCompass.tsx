import { cx } from "@/lib/cx";

const DIRECTIONS = [
  "Северный",
  "Северо-восточный",
  "Восточный",
  "Юго-восточный",
  "Южный",
  "Юго-западный",
  "Западный",
  "Северо-западный",
] as const;

export default function WindCompass({
  windDirection,
  className,
}: {
  /** Градусы по часовой стрелке от севера, откуда дует ветер. */
  windDirection: number;
  className?: string;
}) {
  const title = DIRECTIONS[Math.round(windDirection / 45) % DIRECTIONS.length];

  return (
    <span
      className={cx("inline-block origin-center select-none", className)}
      title={title}
      style={{ transform: `rotate(${windDirection}deg)` }}
    >
      ↑
    </span>
  );
}
