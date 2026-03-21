'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, Infinity as InfinityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TeamSide = ({ 
  name, 
  score, 
  setsWon,
  label, 
  side,
  color, 
  onScoreChange,
  onScoreDialogRequest,
  onNameLongPress,
  onSetWinIncrement,
  unlimitedSets = false
}: { 
  name: string; 
  score: number; 
  setsWon: number;
  label: string; 
  side: 'left' | 'right';
  color: 'primary' | 'secondary';
  onScoreChange: (delta: number) => void;
  onScoreDialogRequest: () => void;
  onNameLongPress: () => void;
  onSetWinIncrement: () => void;
  unlimitedSets?: boolean;
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [lastDelta, setLastDelta] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const swipeLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nameLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const startYRef = useRef<number | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  const startHold = (delta: number) => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = setInterval(() => {
      onScoreChange(delta * 5);
    }, 1500);
  };

  const stopHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  // --- Name Long Press Handlers ---
  const handleNameStart = () => {
    longPressTriggeredRef.current = false;
    nameLongPressTimerRef.current = setTimeout(() => {
      onNameLongPress();
      longPressTriggeredRef.current = true;
    }, 600);
  };

  const handleNameEnd = () => {
    if (nameLongPressTimerRef.current) {
      clearTimeout(nameLongPressTimerRef.current);
      nameLongPressTimerRef.current = null;
    }
  };

  const handleNameClick = () => {
    if (!longPressTriggeredRef.current) {
      onSetWinIncrement();
    }
  };

  // --- Score Swipe/Tap/Hold Handlers ---
  const handleScoreStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = y;
    hasMovedRef.current = false;
    
    // Long press on score opens dialog
    swipeLongPressTimerRef.current = setTimeout(() => {
      onScoreDialogRequest();
      startYRef.current = null; 
    }, 600);
  };

  const handleScoreEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (swipeLongPressTimerRef.current) clearTimeout(swipeLongPressTimerRef.current);
    
    if (startYRef.current !== null) {
      const y = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
      const diff = startYRef.current - y;
      
      if (Math.abs(diff) > 30) {
        // Swipe
        const delta = diff > 0 ? 1 : -1;
        onScoreChange(delta);
      } else if (!hasMovedRef.current) {
        // Tap
        onScoreChange(1);
      }
    }
    
    stopHold();
    startYRef.current = null;
  };

  const handleScoreMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startYRef.current === null) return;
    
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = startYRef.current - y;

    if (Math.abs(diff) > 10) {
      hasMovedRef.current = true;
      if (swipeLongPressTimerRef.current) {
        clearTimeout(swipeLongPressTimerRef.current);
        swipeLongPressTimerRef.current = null;
      }
    }

    // Hold detection
    if (Math.abs(diff) > 50 && !isHolding) {
      setIsHolding(true);
      const delta = diff > 0 ? 1 : -1;
      setLastDelta(delta);
      startHold(delta);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-1/2 h-full flex flex-col items-center justify-center overflow-hidden select-none touch-none transition-colors duration-700",
        color === 'primary' ? "bg-bg-secondary" : "bg-bg"
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-transparent",
        color === 'primary' ? "from-primary" : "from-secondary"
      )} />

      {/* Team Info Area - Separate Hitbox for Name Long Press */}
      <div 
        className="absolute top-20 flex flex-col items-center z-20 pointer-events-auto cursor-pointer group/name"
        onMouseDown={handleNameStart}
        onMouseUp={handleNameEnd}
        onMouseLeave={handleNameEnd}
        onTouchStart={handleNameStart}
        onTouchEnd={handleNameEnd}
        onClick={handleNameClick}
      >
        <span className={cn(
          "font-body text-[10px] tracking-[0.3em] uppercase mb-2 font-bold",
          color === 'primary' ? "text-primary" : "text-secondary"
        )}>
          {label}
        </span>
        <h2 className="font-headline text-4xl font-black tracking-tight uppercase transition-transform group-active/name:scale-95 text-on-surface">{name}</h2>
        <div className="mt-4 flex gap-3">
          {unlimitedSets ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <InfinityIcon size={12} className={color === 'primary' ? "text-primary" : "text-secondary"} />
              <span className="text-[10px] font-bold text-on-surface">{setsWon}</span>
            </div>
          ) : (
            [1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-3 h-3 rounded-full transition-all duration-500 border",
                i <= setsWon 
                  ? (color === 'primary' ? "bg-primary border-primary shadow-[0_0_15px_var(--theme-primary-muted)]" : "bg-secondary border-secondary shadow-[0_0_15px_var(--theme-secondary-muted)]") 
                  : "bg-white/5 border-white/10"
              )} />
            ))
          )}
        </div>
      </div>

      {/* Score Area - Main Interaction */}
      <div className="flex flex-col items-center justify-center pointer-events-auto w-full h-full pt-20">
        {/* Plus Zone */}
        <button 
          onClick={() => onScoreChange(1)}
          className={cn(
            "z-30 p-8 transition-all active:scale-90 hover:opacity-100 opacity-20",
            color === 'primary' ? "text-primary" : "text-secondary"
          )}
        >
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Plus size={64} strokeWidth={3} />
          </motion.div>
        </button>

        {/* Number Zone */}
        <div 
          className="relative z-20 cursor-pointer"
          onMouseMove={handleScoreMove}
          onMouseUp={handleScoreEnd}
          onMouseLeave={handleScoreEnd}
          onTouchMove={handleScoreMove}
          onTouchEnd={handleScoreEnd}
          onMouseDown={handleScoreStart}
          onTouchStart={handleScoreStart}
        >
          <motion.div 
            animate={{ y: isHolding ? (lastDelta > 0 ? -10 : 10) : 0 }}
            className="flex flex-col items-center"
          >
            <span className={cn(
              "font-headline text-[28rem] font-black leading-none tracking-tighter transition-all duration-300",
              color === 'primary' ? "text-primary score-glow-primary" : "text-secondary score-glow-secondary"
            )}>
              {score}
            </span>
          </motion.div>
        </div>

        {/* Minus Zone */}
        <button 
          onClick={() => onScoreChange(-1)}
          className={cn(
            "z-30 p-8 transition-all active:scale-90 hover:opacity-100 opacity-20",
            color === 'primary' ? "text-primary" : "text-secondary"
          )}
        >
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Minus size={64} strokeWidth={3} />
          </motion.div>
        </button>
      </div>

      {/* Side Accent */}
      <div className={cn(
        "absolute top-1/4 bottom-1/4 w-1.5 rounded-full blur-[1px]",
        side === 'left' ? "left-0" : "right-0",
        color === 'primary'
          ? "bg-primary shadow-[0_0_20px_var(--theme-primary-muted)]"
          : "bg-secondary shadow-[0_0_20px_var(--theme-secondary-muted)]"
      )} />
    </div>
  );
};
