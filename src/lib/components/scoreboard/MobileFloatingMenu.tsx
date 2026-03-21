import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, Maximize2, Menu, Minimize2, RefreshCw, Settings, Undo2, X } from "lucide-react";

type Props = {
  isCompactMobile: boolean;
  mobileMenuOpen: boolean;
  canUndo: boolean;
  supportsFullscreen: boolean;
  isFullscreen: boolean;
  onToggleOpen: () => void;
  onReset: () => void;
  onSwitchSides: () => void;
  onUndo: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
};

export function MobileFloatingMenu({
  isCompactMobile,
  mobileMenuOpen,
  canUndo,
  supportsFullscreen,
  isFullscreen,
  onToggleOpen,
  onReset,
  onSwitchSides,
  onUndo,
  onOpenSettings,
  onToggleFullscreen,
}: Props) {
  if (!isCompactMobile) return null;

  return (
    <div
      className="fixed z-50 pointer-events-auto"
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
            className="absolute bottom-14 right-0 w-48 rounded-2xl border border-white/10 glass-panel p-2 shadow-2xl flex flex-col gap-1"
          >
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/10 transition-all"
            >
              <RefreshCw size={14} className="text-primary" />
              Reset
            </button>
            <button
              onClick={onSwitchSides}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/10 transition-all"
            >
              <ArrowLeftRight size={14} className="text-primary" />
              Switch sides
            </button>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <Undo2 size={14} className="text-primary" />
              Undo
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/10 transition-all"
            >
              <Settings size={14} className="text-primary" />
              Settings
            </button>
            {supportsFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/10 transition-all"
              >
                {isFullscreen ? (
                  <Minimize2 size={14} className="text-primary" />
                ) : (
                  <Maximize2 size={14} className="text-primary" />
                )}
                Fullscreen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onToggleOpen}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        className="h-12 w-12 rounded-full glass-panel border border-white/10 shadow-2xl flex items-center justify-center text-primary active:scale-95 transition-transform"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
