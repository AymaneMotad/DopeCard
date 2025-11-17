"use client";

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from './icons';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

export function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex justify-between items-center group py-2"
        aria-expanded={isOpen}
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">
          {question}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-blue-600 dark:text-blue-400 flex-shrink-0"
        >
          <ArrowRight className="h-5 w-5" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? 16 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

