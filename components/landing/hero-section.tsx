"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Play } from './icons';
import { Button } from '@/components/ui/button';
import { BusinessShowcase } from './business-showcase';
import { ScrollIndicator } from './scroll-indicator';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md border border-blue-200/50 dark:border-blue-800/50 mb-8 shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            La Solution #1 au Maroc
          </span>
        </motion.div>

        {/* Main headline with advanced typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-8xl xl:text-9xl font-extrabold mb-8 leading-[1.1] tracking-tight"
        >
          <motion.span
            className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            Révolutionnez
          </motion.span>
          <span className="block text-gray-900 dark:text-white mt-2">
            Votre Fidélisation
          </span>
          <motion.span
            className="block bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mt-2"
            animate={{
              backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
              delay: 2.5
            }}
          >
            Client
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
        >
          DopeCard transforme les cartes de fidélité physiques en{' '}
          <span className="font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            expériences digitales modernes
          </span>
          . Intégration native{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            Apple Wallet & Google Pay
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-7 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3">
                Commencer Gratuitement
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg" 
              variant="outline"
              className="group px-10 py-7 text-lg font-semibold rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg"
            >
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Voir la Démo
              </span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Business showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <BusinessShowcase />
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

