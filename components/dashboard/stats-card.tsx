"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  description: string;
  stats: Array<{
    label: string;
    value: string | number;
  }>;
  isLoading?: boolean;
  delay?: number;
}

export function StatsCard({ title, description, stats, isLoading = false, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
        {/* Subtle Gradient Background - 20% gradient colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-blue-50/25 to-purple-50/20 dark:from-slate-900/50 dark:via-blue-950/20 dark:to-purple-950/15" />
        
        {/* Subtle Accent Border - 20% gradient colors */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/25 to-purple-400/20 dark:via-blue-600/25 dark:to-purple-600/20" />

        <CardHeader className="relative z-10">
          <CardTitle className="text-slate-900 dark:text-slate-100">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + index * 0.1 }}
                  className="text-center p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

