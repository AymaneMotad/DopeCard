"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  gradient: "blue" | "purple" | "pink" | "green";
  delay?: number;
  isLoading?: boolean;
}

const gradients = {
  blue: "from-slate-100 via-blue-100/60 to-slate-100 dark:from-slate-800 dark:via-blue-900/40 dark:to-slate-800",
  purple: "from-slate-100 via-purple-100/60 to-slate-100 dark:from-slate-800 dark:via-purple-900/40 dark:to-slate-800",
  pink: "from-slate-100 via-pink-100/60 to-slate-100 dark:from-slate-800 dark:via-pink-900/40 dark:to-slate-800",
  green: "from-slate-100 via-emerald-100/60 to-slate-100 dark:from-slate-800 dark:via-emerald-900/40 dark:to-slate-800",
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  delay = 0,
  isLoading = false,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group cursor-pointer bg-white dark:bg-slate-900">
        {/* Gradient Background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
            gradients[gradient]
          )}
        />
        
        {/* Subtle Accent Border - 20% gradient colors */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          gradient === "blue" && "bg-gradient-to-r from-transparent via-blue-400/30 to-transparent dark:via-blue-600/30",
          gradient === "purple" && "bg-gradient-to-r from-transparent via-purple-400/30 to-transparent dark:via-purple-600/30",
          gradient === "pink" && "bg-gradient-to-r from-transparent via-pink-400/30 to-transparent dark:via-pink-600/30",
          gradient === "green" && "bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent dark:via-emerald-600/30"
        )} />

        {/* Content */}
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700">
            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.3 }}
                className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1"
              >
                {value}
              </motion.div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

