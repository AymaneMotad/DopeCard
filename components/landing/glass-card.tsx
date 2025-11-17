"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({ 
  children, 
  className = "", 
  delay = 0,
  hover = false 
}: GlassCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

