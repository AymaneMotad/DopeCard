"use client";

import { trpc } from "@/server/client";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { SkeletonMetricCard } from "@/components/dashboard/skeleton-card";
import { Users, CreditCard, TrendingUp, Activity, Plus, Scan } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = trpc.analytics.getOverview.useQuery();
  const { data: customerStats, isLoading: statsLoading } = trpc.analytics.getCustomerStats.useQuery();
  const { data: recentActivity, isLoading: activityLoading } = trpc.analytics.getRecentActivity.useQuery({ limit: 10 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/15 dark:from-slate-950 dark:via-blue-950/15 dark:to-purple-950/10">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-700/80 to-purple-700/60 dark:from-slate-100 dark:via-blue-300/80 dark:to-purple-300/60 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your loyalty program.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/cards/create">
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Create Card
              </Button>
            </Link>
            <Link href="/scanner">
              <Button 
                variant="outline" 
                className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <Scan className="h-4 w-4 mr-2" />
                Scanner
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewLoading ? (
            <>
              <SkeletonMetricCard delay={0} />
              <SkeletonMetricCard delay={0.1} />
              <SkeletonMetricCard delay={0.2} />
              <SkeletonMetricCard delay={0.3} />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Customers"
                value={overview?.totalCustomers || 0}
                description="All registered customers"
                icon={Users}
                gradient="blue"
                delay={0}
              />
              <MetricCard
                title="Cards This Month"
                value={overview?.cardsThisMonth || 0}
                description="New cards issued"
                icon={CreditCard}
                gradient="purple"
                delay={0.1}
              />
              <MetricCard
                title="Total Cards"
                value={overview?.totalCards || 0}
                description="All time cards issued"
                icon={TrendingUp}
                gradient="pink"
                delay={0.2}
              />
              <MetricCard
                title="Active Cards"
                value={overview?.activeCards || 0}
                description="Activity in last 30 days"
                icon={Activity}
                gradient="green"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Customer Stats */}
        {customerStats && (
          <div className="mb-8">
            <StatsCard
              title="Customer Statistics"
              description="Overview of customer engagement"
              stats={[
                {
                  label: "Total Customers",
                  value: customerStats.totalCustomers || 0,
                },
                {
                  label: "Customers with Passes",
                  value: customerStats.customersWithPasses || 0,
                },
                {
                  label: "Average Stamps",
                  value: customerStats.averageStamps?.toFixed(1) || "0.0",
                },
              ]}
              isLoading={statsLoading}
              delay={0.4}
            />
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-8">
          <ActivityCard
            activities={recentActivity || []}
            isLoading={activityLoading}
            delay={0.6}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link href="/cards">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit mb-3 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <CreditCard className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">View All Cards</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage your loyalty cards</p>
            </motion.div>
          </Link>
          <Link href="/customers">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit mb-3 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <Users className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">View Customers</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">See all your customers</p>
            </motion.div>
          </Link>
          <Link href="/scanner">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit mb-3 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <Scan className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">Open Scanner</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Scan customer QR codes</p>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
