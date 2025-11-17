"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, 20]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500"
      >
        <span className="text-sm font-medium">Découvrir</span>
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </motion.div>
  );
}

