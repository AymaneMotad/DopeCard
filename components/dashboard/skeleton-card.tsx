"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function SkeletonMetricCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent className="relative z-10">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SkeletonStatsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
        <CardHeader className="relative z-10">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SkeletonActivityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
        <CardHeader className="relative z-10">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="relative z-10 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

