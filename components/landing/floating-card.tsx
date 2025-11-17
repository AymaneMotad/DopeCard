"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  intensity?: number;
}

export function FloatingCard({ 
  children, 
  delay = 0, 
  className = "",
  intensity = 20 
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -intensity, 0],
      }}
      transition={{
        duration: 3 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

