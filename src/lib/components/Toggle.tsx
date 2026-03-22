'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const Toggle = ({ active, onToggle, label, sublabel, icon: Icon }: any) => (
  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
        active ? "bg-primary/20 text-primary" : "bg-white/5 text-on-surface-variant"
      )}>
        <Icon size={24} className="shrink-0" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface">{label}</span>
        <span className="mt-0.5 text-[10px] leading-relaxed text-on-surface-variant">{sublabel}</span>
      </div>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300",
        active ? "bg-primary" : "bg-white/10"
      )}
    >
      <motion.div
        initial={false}
        animate={{ x: active ? 28 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="absolute left-0.5 top-1 h-4 w-4 rounded-full bg-white shadow-sm"
      />
    </button>
  </div>
);
