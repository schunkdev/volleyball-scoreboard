'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, ChevronDown, Zap, Infinity as InfinityIcon, Check } from 'lucide-react';
import { Toggle } from './Toggle';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';

export const SettingsDialog = ({ 
  isOpen, 
  onClose, 
  config,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  config: { gameMode: boolean; unlimitedSets: boolean; theme: string };
  onSave: (newConfig: { gameMode: boolean; unlimitedSets: boolean; theme: string }) => void;
}) => {
  const [gameMode, setGameMode] = useState(config.gameMode);
  const [unlimitedSets, setUnlimitedSets] = useState(config.unlimitedSets);
  const [theme, setTheme] = useState(config.theme);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const handleShowGuideAgain = () => {
    window.dispatchEvent(new Event('vb-scoreboard-show-quickguide'));
    onClose();
  };

  if (!isOpen) return null;

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-surface p-10 rounded-[40px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] min-w-[440px] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase mb-2 text-on-surface">Settings</h2>
        <div className="w-12 h-1.5 bg-primary rounded-full mb-10 shadow-[0_0_15px_var(--theme-primary)]" />

        <div className="w-full space-y-4 mb-10">
          <Toggle 
            active={gameMode} 
            onToggle={() => setGameMode(!gameMode)} 
            label="Game Mode" 
            sublabel="Automatic set wins at 25 points (2-point lead required). Score resets on set win."
            icon={Zap}
          />
          <Toggle 
            active={unlimitedSets} 
            onToggle={() => setUnlimitedSets(!unlimitedSets)} 
            label="Unlimited Sets" 
            sublabel="Match continues indefinitely. Disables set limits and 'Match Over' announcements."
            icon={InfinityIcon}
          />

          {/* Theme Selection */}
          <div className="relative">
            <div 
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 text-white/40">
                  <Palette size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface">Theme Selection</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">Customize visual style and contrast.</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface">
                {currentTheme.name}
                <ChevronDown size={14} className={cn("transition-transform", showThemeSelector && "rotate-180")} />
              </div>
            </div>

            <AnimatePresence>
              {showThemeSelector && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 p-2 bg-surface-variant rounded-2xl border border-white/10 shadow-xl z-50"
                >
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors",
                        theme === t.id ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                        {t.name}
                      </div>
                      {theme === t.id && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full mb-5">
          <button
            type="button"
            onClick={handleShowGuideAgain}
            className="text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary underline underline-offset-4 transition-colors"
          >
            Show quick guide again
          </button>
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95 text-on-surface"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave({ gameMode, unlimitedSets, theme });
              onClose();
            }}
            className="flex-1 py-5 rounded-2xl bg-primary text-primary-contrast font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-[0_0_30px_var(--theme-primary-muted)]"
          >
            Save Config
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
