'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const Toggle = ({ active, onToggle, label, sublabel, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        active ? "bg-primary/20 text-primary" : "bg-white/5 text-on-surface-variant"
      )}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface">{label}</span>
        <span className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">{sublabel}</span>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={cn(
        "w-12 h-6 rounded-full relative transition-colors duration-300",
        active ? "bg-primary" : "bg-white/10"
      )}
    >
      <motion.div 
        animate={{ x: active ? 26 : 2 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  </div>
);
