'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Maximize2 } from 'lucide-react';

export const OrientationGuard = () => {
  const [isLandscape, setIsLandscape] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  if (!mounted || isLandscape) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center p-8 text-center text-on-surface">
      <motion.div
        animate={{ rotate: 90 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8 text-primary"
      >
        <Maximize2 size={64} />
      </motion.div>
      <h2 className="text-2xl font-headline font-bold mb-4">Landscape Mode Required</h2>
      <p className="text-on-surface-variant max-w-xs">
        Please rotate your device for the best scoreboard experience.
      </p>
    </div>
  );
};
