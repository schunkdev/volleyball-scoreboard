'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ScoreDialog = ({ 
  isOpen, 
  onClose, 
  currentScore, 
  onConfirm, 
  color 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentScore: number; 
  onConfirm: (val: number) => void;
  color: 'primary' | 'secondary';
}) => {
  const [val, setVal] = useState(currentScore);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle numeric input
      if (/^[0-9]$/.test(e.key)) {
        setVal(prev => {
          if (!hasStartedTyping) {
            setHasStartedTyping(true);
            return parseInt(e.key);
          }
          const next = parseInt(`${prev}${e.key}`);
          return next > 999 ? prev : next;
        });
      } 
      // Handle backspace
      else if (e.key === 'Backspace') {
        setVal(prev => {
          const s = prev.toString();
          if (s.length <= 1) {
            setHasStartedTyping(false);
            return 0;
          }
          return parseInt(s.slice(0, -1));
        });
      }
      // Handle confirm
      else if (e.key === 'Enter') {
        onConfirm(val);
        onClose();
      }
      // Handle close
      else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, val, onConfirm, onClose, hasStartedTyping]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl min-w-[280px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Set Score</span>
            <span className="text-[8px] uppercase tracking-widest text-white/20 mt-1">Keyboard Input Enabled</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white p-2 -mr-2 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-8 mb-10">
          <button 
            onClick={() => {
              setVal(Math.max(0, val - 1));
              setHasStartedTyping(true);
            }}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-surface-variant hover:bg-white/10 transition-all active:scale-90"
          >
            <Minus size={28} className={color === 'primary' ? 'text-primary' : 'text-secondary'} />
          </button>
          
          <div className="relative flex flex-col items-center">
            <span className={cn(
              "text-8xl font-headline font-black min-w-[120px] text-center transition-all duration-300",
              hasStartedTyping ? "text-on-surface" : "text-on-surface-variant"
            )}>
              {val}
            </span>
            <div className={cn(
              "absolute -bottom-2 w-12 h-1 rounded-full transition-all duration-500",
              color === 'primary' ? "bg-primary shadow-[0_0_10px_var(--theme-primary)]" : "bg-secondary shadow-[0_0_10px_var(--theme-secondary)]",
              hasStartedTyping ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )} />
          </div>

          <button 
            onClick={() => {
              setVal(val + 1);
              setHasStartedTyping(true);
            }}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-surface-variant hover:bg-white/10 transition-all active:scale-90"
          >
            <Plus size={28} className={color === 'primary' ? 'text-primary' : 'text-secondary'} />
          </button>
        </div>

        <button 
          onClick={() => {
            onConfirm(val);
            onClose();
          }}
          className={cn(
            "w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-lg",
            color === 'primary' 
              ? "bg-primary text-primary-contrast shadow-[0_0_20px_var(--theme-primary-muted)]" 
              : "bg-secondary text-secondary-contrast shadow-[0_0_20px_var(--theme-secondary-muted)]"
          )}
        >
          Confirm Score
        </button>
      </motion.div>
    </motion.div>
  );
};
