import { Maximize2, Minimize2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isCompactMobile: boolean;
  currentSet: number;
  setsWonA: number;
  setsWonB: number;
  unlimitedSets: boolean;
  supportsFullscreen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
};

export function ScoreboardHeader({
  isCompactMobile,
  currentSet,
  setsWonA,
  setsWonB,
  unlimitedSets,
  supportsFullscreen,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
}: Props) {
  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-40 flex justify-between items-center pointer-events-none",
        isCompactMobile ? "px-3 py-2.5" : "px-8 py-6",
      )}
    >
      <div className={cn(isCompactMobile ? "w-20" : "w-48")} />

      {!isCompactMobile && (
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-4 bg-surface-container/40 backdrop-blur-md rounded-full border border-white/5 px-8 py-2">
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="font-headline font-black text-xl text-primary">
                {!unlimitedSets && (setsWonA === 3 || setsWonB === 3)
                  ? "FINAL"
                  : currentSet}
              </span>
              <span className="font-bold uppercase tracking-widest text-primary/90 text-[10px]">
                {setsWonA}-{setsWonB}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "pointer-events-auto",
          isCompactMobile ? "hidden" : "flex gap-6",
        )}
      >
        {supportsFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <Settings size={24} />
        </button>
      </div>
    </header>
  );
}
