"use client";

import { motion } from 'framer-motion';
import { Coffee, ShopIcon, Scissors, Car, Utensils, Dumbbell } from './icons';
import { FloatingCard } from './floating-card';

const businesses = [
  { icon: Coffee, name: "Cafés", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", delay: 0 },
  { icon: ShopIcon, name: "Boutiques", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", delay: 0.2 },
  { icon: Scissors, name: "Salons", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400", delay: 0.4 },
  { icon: Car, name: "Services", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", delay: 0.6 },
  { icon: Utensils, name: "Restaurants", color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400", delay: 0.8 },
  { icon: Dumbbell, name: "Fitness", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", delay: 1 },
];

export function BusinessShowcase() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
      {businesses.map((business, idx) => {
        const Icon = business.icon;
        return (
          <FloatingCard key={idx} delay={business.delay} intensity={15}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className={`p-4 rounded-xl ${business.color} mb-3 transition-transform duration-300 hover:scale-110`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm text-center">
                {business.name}
              </span>
            </motion.div>
          </FloatingCard>
        );
      })}
    </div>
  );
}

