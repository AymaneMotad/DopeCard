"use client";

import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Sparkles, Grid3x3 } from "lucide-react";
import { TemplateCard } from "@/components/cards/template-card";
import { getAllCardTemplates, getCardTemplatesByType } from "@/modules/pass-generation/card-templates";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardsPage() {
  const router = useRouter();
  const { data: cards, isLoading, isError } = trpc.cards.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const [selectedType, setSelectedType] = useState<'all' | 'stamp' | 'points' | 'discount'>('all');

  const allTemplates = getAllCardTemplates();
  const filteredTemplates = useMemo(() => {
    return selectedType === 'all' 
      ? allTemplates 
      : getCardTemplatesByType(selectedType);
  }, [selectedType]);

  // Stabilize cards array to prevent unnecessary re-renders
  const stableCards = useMemo(() => {
    if (!cards || !Array.isArray(cards)) return [];
    return cards.map(card => ({
      ...card,
      key: card.id || `card-${card.name}-${card.createdAt}`,
    }));
  }, [cards]);

  const handleTemplateSelect = (template: any) => {
    router.push(`/cards/create?template=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              My Cards
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose a pre-designed template or create a custom card
            </p>
          </div>
        <Link href="/cards/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-12 px-6">
            <Plus className="h-5 w-5 mr-2" />
              Create Custom Card
          </Button>
        </Link>
        </motion.div>

        {/* Pre-designed Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Pre-designed Templates
              </h2>
              <p className="text-base text-muted-foreground">
                Choose from professionally designed templates that work perfectly with pass generation
              </p>
            </div>
          </div>

          {/* Template Type Filter */}
          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-4 h-12">
              <TabsTrigger value="all" className="text-sm font-medium">All</TabsTrigger>
              <TabsTrigger value="stamp" className="text-sm font-medium">Stamps</TabsTrigger>
              <TabsTrigger value="points" className="text-sm font-medium">Points</TabsTrigger>
              <TabsTrigger value="discount" className="text-sm font-medium">Discount</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Existing Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Grid3x3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your Cards
              </h2>
              <p className="text-base text-muted-foreground">
                Manage your existing loyalty cards
              </p>
            </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-lg z-0" />
                  <CardHeader className="relative z-10 p-6">
                    <Skeleton className="h-7 w-40 mb-3 bg-white/50" />
                    <Skeleton className="h-4 w-56 bg-white/30" />
              </CardHeader>
                  <CardContent className="relative z-10 p-6 pt-0">
                    <Skeleton className="h-11 w-full bg-white/50" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-0 shadow-lg relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg z-0" />
              <CardContent className="relative z-10 flex flex-col items-center justify-center py-16 px-6">
                <p className="text-red-500 dark:text-red-400 mb-6 text-center text-lg">
                  Error loading cards. Please try again.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-11 px-6"
                >
                  Reload
                </Button>
              </CardContent>
            </Card>
          ) : stableCards && stableCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stableCards.map((card: any) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: 'transform' }}
                >
                  <Card className="cursor-pointer hover:shadow-xl transition-all duration-200 border-0 shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-lg z-0" />
                    <CardHeader className="relative z-10 p-6 pb-4">
                      <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {card.name || 'Unnamed Card'}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                        Type: {card.type || 'N/A'} | {card.active ? 'Active' : 'Inactive'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 p-6 pt-0">
                <Button
                  variant="outline"
                        className="w-full h-11 border-2 border-blue-200 dark:border-blue-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all font-medium"
                  onClick={() => router.push(`/cards/${card.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
                </motion.div>
          ))}
        </div>
      ) : (
            <Card className="border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-lg z-0" />
              <CardContent className="relative z-10 flex flex-col items-center justify-center py-16 px-6">
                <div className="p-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6 shadow-lg">
                  <Grid3x3 className="h-10 w-10 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-center font-medium text-lg">
                  No cards created yet. Choose a template above to get started!
                </p>
            <Link href="/cards/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-12 px-6">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Card
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
        </motion.div>
      </div>
    </div>
  );
}
