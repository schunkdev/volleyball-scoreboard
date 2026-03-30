import { ArrowLeftRight, History, RefreshCw, Trophy, Undo2 } from "lucide-react";
import { NavButton } from "@/lib/components/NavButton";
import { type CompletedSet } from "@/lib/types/scoreboard";

type Props = {
  isCompactMobile: boolean;
  gameMode: boolean;
  completedSets: CompletedSet[];
  isSwapped: boolean;
  setsWonA: number;
  setsWonB: number;
  unlimitedSets: boolean;
  currentSet: number;
  canUndo: boolean;
  onReset: () => void;
  onSwitchSides: () => void;
  onUndo: () => void;
};

export function DesktopBottomMenu({
  isCompactMobile,
  gameMode,
  completedSets,
  isSwapped,
  setsWonA,
  setsWonB,
  unlimitedSets,
  currentSet,
  canUndo,
  onReset,
  onSwitchSides,
  onUndo,
}: Props) {
  if (isCompactMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-8 pointer-events-none">
      <div className="flex flex-wrap justify-center gap-4 mb-6 pointer-events-auto max-w-[95vw]">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-full border border-white/5 hover:bg-white/10 transition-all active:scale-95"
        >
          <RefreshCw size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Reset
          </span>
        </button>
        <button
          onClick={onSwitchSides}
          className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-full border border-white/5 hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeftRight size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Switch Sides
          </span>
        </button>
      </div>

      {gameMode && completedSets.length > 0 && (
        <div className="mb-4 flex max-w-[90vw] gap-2 overflow-x-auto pointer-events-auto px-2">
          {completedSets.map((set, index) => {
            const leftScore = isSwapped ? set.b : set.a;
            const rightScore = isSwapped ? set.a : set.b;
            return (
              <div
                key={`${index}-${set.a}-${set.b}`}
                className="shrink-0 rounded-full border border-white/10 bg-surface-container/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface"
              >
                S{index + 1} {leftScore}-{rightScore}
              </div>
            );
          })}
        </div>
      )}

      <nav className="glass-panel px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 pointer-events-auto">
        <NavButton icon={<Trophy size={20} />} label="Match" active />
        <NavButton icon={<History size={20} />} label="History" disabled />
        <NavButton icon={<Undo2 size={20} />} label="Undo" onClick={onUndo} disabled={!canUndo} />
      </nav>
    </div>
  );
}
