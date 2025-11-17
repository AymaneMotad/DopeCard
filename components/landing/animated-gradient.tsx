"use client";

import { motion } from 'framer-motion';

export function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 will-change-transform">
      {/* Reduced to 3 gradients for better performance */}
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 80, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse"
        }}
        style={{ willChange: 'transform' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
          delay: 2
        }}
        style={{ willChange: 'transform' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: [0, 60, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
          delay: 4
        }}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
