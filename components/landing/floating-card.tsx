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
  intensity = 15 
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -intensity, 0],
      }}
      transition={{
        duration: 4 + delay * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
        repeatType: "reverse"
      }}
      className={className}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}

