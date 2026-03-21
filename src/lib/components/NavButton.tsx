'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function NavButton({ 
  icon, 
  label, 
  active = false, 
  disabled = false,
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  disabled?: boolean,
  onClick?: () => void
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center px-6 py-2.5 rounded-xl transition-all",
        active ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-white/5",
        disabled && "opacity-20 cursor-not-allowed grayscale pointer-events-none",
        !disabled && "active:scale-90"
      )}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">{label}</span>
    </button>
  );
}
