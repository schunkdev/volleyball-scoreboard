import { Layers } from "lucide-react";

type Props = {
  isCompactMobile: boolean;
  unlimitedSets: boolean;
  setsWonA: number;
  setsWonB: number;
  currentSet: number;
};

export function MobileSetIndicator({
  isCompactMobile,
  unlimitedSets,
  setsWonA,
  setsWonB,
  currentSet,
}: Props) {
  if (!isCompactMobile) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none"
      style={{
        bottom: "max(env(safe-area-inset-bottom), 0.75rem)",
      }}
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface-container/70 backdrop-blur-md px-3 py-1.5 shadow-xl">
        <Layers size={11} className="text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
          {!unlimitedSets && (setsWonA === 3 || setsWonB === 3)
            ? "Match Over"
            : `Set ${currentSet}${unlimitedSets ? "" : " of 5"}`}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
          {setsWonA}-{setsWonB}
        </span>
      </div>
    </div>
  );
}
