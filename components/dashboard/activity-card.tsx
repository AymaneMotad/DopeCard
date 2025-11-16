"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Sparkles } from "lucide-react";

interface Activity {
  id: string;
  createdAt: string;
  metadata?: {
    stampCount?: number;
    [key: string]: any;
  };
}

interface ActivityCardProps {
  activities: Activity[];
  isLoading?: boolean;
  delay?: number;
}

export function ActivityCard({ activities, isLoading = false, delay = 0 }: ActivityCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
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

  if (!activities || activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
          <CardHeader className="relative z-10">
            <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recent Activity
            </CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest transactions and updates</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + index * 0.05 }}
                className="flex justify-between items-center p-4 rounded-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      Pass Update
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {activity.metadata?.stampCount !== undefined && (
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                    {activity.metadata.stampCount} stamps
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

