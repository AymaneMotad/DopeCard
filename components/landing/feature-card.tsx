"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient, 
  delay = 0 
}: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, rotateY: 5, z: 50 }}
      className="group perspective-1000"
    >
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl hover:shadow-3xl p-8 h-full cursor-pointer transition-all duration-300">
        <motion.div
          className={`inline-flex p-5 rounded-2xl mb-6 ${gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-white">{icon}</div>
        </motion.div>
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

