/**
 * Centralized icon exports for the landing page
 * This file consolidates all Lucide React icons used across landing components
 */

import type { LucideIcon } from 'lucide-react';
import {
  // Navigation & Actions
  ArrowRight,
  ChevronDown,
  Play,
  
  // Status & Feedback
  CheckCircle2,
  Sparkles,
  Zap,
  Star,
  
  // Features
  QrCode,
  Smartphone,
  Gift,
  Bell,
  TrendingUp,
  Heart,
  Rocket,
  
  // Trust & Security
  Shield,
  Globe,
  Award,
  
  // Stats & Analytics
  Users,
  Clock,
  Store,
  
  // Business Types
  Coffee,
  Scissors,
  Car,
  Utensils,
  Dumbbell,
} from 'lucide-react';

// Re-export Store as ShopIcon to avoid naming conflicts
export { Store as ShopIcon } from 'lucide-react';

// Export all icons
export {
  ArrowRight,
  ChevronDown,
  Play,
  CheckCircle2,
  Sparkles,
  Zap,
  Star,
  QrCode,
  Smartphone,
  Gift,
  Bell,
  TrendingUp,
  Heart,
  Rocket,
  Shield,
  Globe,
  Award,
  Users,
  Clock,
  Store,
  Coffee,
  Scissors,
  Car,
  Utensils,
  Dumbbell,
};

// Icon type for TypeScript
export type Icon = LucideIcon;

