'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EditTeamDialog = ({ 
  isOpen, 
  onClose, 
  currentName, 
  currentSets,
  onConfirm, 
  color,
  maxSets = 3
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentName: string; 
  currentSets: number;
  onConfirm: (name: string, sets: number) => void;
  color: 'primary' | 'secondary';
  maxSets?: number;
}) => {
  const [name, setName] = useState(currentName);
  const [sets, setSets] = useState(currentSets);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-6 pointer-events-auto bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-[440px] max-h-[calc(100dvh-max(env(safe-area-inset-top),0.75rem)-max(env(safe-area-inset-bottom),0.75rem)-1.5rem)] overflow-y-auto p-5 md:p-8 rounded-3xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Edit Team</span>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-2 -mr-2 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-5 md:space-y-8">
          {/* Name Input */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Team Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-surface-variant border-none rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-lg md:text-xl font-headline font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onConfirm(name, sets);
                  onClose();
                }
              }}
            />
          </div>

          {/* Sets Adjustment */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Sets Won</label>
            <div className="flex items-center justify-between bg-surface-variant rounded-2xl p-2">
              <button
                onClick={() => setSets(Math.max(0, sets - 1))}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-on-surface"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl md:text-3xl font-headline font-black text-on-surface">{sets}</span>
              <button
                onClick={() => setSets(Math.min(maxSets, sets + 1))}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-on-surface"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            onConfirm(name, sets);
            onClose();
          }}
          className={cn(
            "w-full mt-6 md:mt-10 py-3.5 md:py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-lg",
            color === 'primary' 
              ? "bg-primary text-primary-contrast shadow-[0_0_20px_var(--theme-primary-muted)]" 
              : "bg-secondary text-secondary-contrast shadow-[0_0_20px_var(--theme-secondary-muted)]"
          )}
        >
          Save Changes
        </button>
      </motion.div>
    </motion.div>
  );
};
