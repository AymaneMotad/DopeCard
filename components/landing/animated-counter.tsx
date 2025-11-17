"use client";

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  end, 
  duration = 2, 
  prefix = "", 
  suffix = "",
  decimals = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = end;
    
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutCubic(progress);
      const current = startValue + (endValue - startValue) * easedProgress;
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  const formattedValue = decimals > 0 
    ? count.toFixed(decimals).replace(/\.?0+$/, '')
    : Math.floor(count).toString();

  return (
    <span ref={ref}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

