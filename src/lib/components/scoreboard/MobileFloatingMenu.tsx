import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, Menu, RefreshCw, Undo2, X } from "lucide-react";

type Props = {
  isCompactMobile: boolean;
  mobileMenuOpen: boolean;
  canUndo: boolean;
  onToggleOpen: () => void;
  onReset: () => void;
  onSwitchSides: () => void;
  onUndo: () => void;
};

export function MobileFloatingMenu({
  isCompactMobile,
  mobileMenuOpen,
  canUndo,
  onToggleOpen,
  onReset,
  onSwitchSides,
  onUndo,
}: Props) {
  if (!isCompactMobile) return null;

  return (
    <div
      className="pointer-events-auto fixed z-50"
      style={{
        right: "max(env(safe-area-inset-right), 0.75rem)",
        bottom: "max(env(safe-area-inset-bottom), 0.75rem)",
      }}
    >
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass-panel absolute bottom-14 right-0 flex w-52 flex-col gap-1 rounded-2xl border border-white/10 p-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-white/10"
            >
              <RefreshCw size={14} className="text-primary" />
              Reset
            </button>
            <button
              type="button"
              onClick={onSwitchSides}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-white/10"
            >
              <ArrowLeftRight size={14} className="text-primary" />
              Switch sides
            </button>
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
            >
              <Undo2 size={14} className="text-primary" />
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onToggleOpen}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        className="flex h-12 w-12 items-center justify-center rounded-full glass-panel border border-white/10 text-primary shadow-2xl transition-transform active:scale-95"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
