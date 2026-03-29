import { cn } from "@/lib/utils";

type Props = {
  currentSet: number;
  setsWonA: number;
  setsWonB: number;
  unlimitedSets: boolean;
  /** Taller typography and padding for header; compact for landscape phones */
  size: "header" | "compact";
  className?: string;
};

export function SetScoreCenterStack({
  currentSet,
  setsWonA,
  setsWonB,
  unlimitedSets,
  size,
  className,
}: Props) {
  const matchOver = !unlimitedSets && (setsWonA === 3 || setsWonB === 3);
  const topLine = matchOver ? "FINAL" : String(currentSet);
  const bottomLine = `${setsWonA}-${setsWonB}`;

  const isHeader = size === "header";

  return (
    <div
      className={cn("flex flex-col items-center gap-1.5 pointer-events-none", className)}
      aria-label={matchOver ? `Match final, sets ${bottomLine}` : `Set ${currentSet}, sets won ${bottomLine}`}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col items-center justify-center rounded-2xl border border-white/15 bg-surface-container/55 text-center shadow-lg backdrop-blur-md",
          isHeader ? "px-7 py-3.5 min-w-[5.75rem]" : "px-5 py-2.5 min-w-[4.25rem]",
        )}
      >
        <span
          className={cn(
            "font-headline font-black leading-none tracking-tight text-primary",
            isHeader ? "text-4xl" : "text-3xl",
            matchOver && "text-[clamp(1rem,4vw,1.75rem)] uppercase",
          )}
        >
          {topLine}
        </span>
      </div>
      <div
        className={cn(
          "flex w-full min-w-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-surface-container/40 text-center shadow-md backdrop-blur-md",
          isHeader ? "px-6 py-2" : "px-4 py-1.5",
        )}
      >
        <span
          className={cn(
            "font-bold tabular-nums tracking-widest text-on-surface",
            isHeader ? "text-sm" : "text-xs",
          )}
        >
          {bottomLine}
        </span>
      </div>
    </div>
  );
}
