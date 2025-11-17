"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardTemplate } from "@/modules/pass-generation/card-templates";
import { Stamp, Coins, Percent, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: CardTemplate;
  onSelect?: (template: CardTemplate) => void;
  delay?: number;
}

const cardTypeIcons = {
  stamp: Stamp,
  points: Coins,
  discount: Percent,
};

const categoryColors = {
  coffee: "from-amber-600 to-amber-800",
  restaurant: "from-orange-500 to-pink-500",
  retail: "from-blue-500 to-cyan-500",
  service: "from-purple-500 to-indigo-500",
  modern: "from-gray-800 to-gray-900",
  classic: "from-amber-700 to-amber-900",
};

export function TemplateCard({ template, onSelect, delay = 0 }: TemplateCardProps) {
  const router = useRouter();
  const Icon = cardTypeIcons[template.cardType];
  const categoryGradient = categoryColors[template.category] || categoryColors.modern;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(template);
    } else {
      router.push(`/cards/create?template=${template.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border-0 shadow-xl group cursor-pointer transition-all duration-300 hover:shadow-2xl">
        {/* Gradient Background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity duration-300",
            categoryGradient
          )}
        />

        {/* Animated Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
          }}
        />

        {/* Preview Color Swatches */}
        <div className="absolute top-5 right-5 flex gap-2.5">
          <div
            className="w-7 h-7 rounded-full border-2 border-white/60 shadow-xl"
            style={{ backgroundColor: template.preview.backgroundColor }}
          />
          <div
            className="w-7 h-7 rounded-full border-2 border-white/60 shadow-xl"
            style={{ backgroundColor: template.preview.accentColor }}
          />
        </div>

        <CardContent className="relative z-10 p-8 flex flex-col h-full">
          {/* Icon and Type */}
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="text-xs font-semibold text-white capitalize">
                {template.cardType}
              </span>
            </div>
          </div>

          {/* Template Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-3">{template.name}</h3>
            <p className="text-sm text-white/90 mb-6 leading-relaxed">{template.description}</p>
            
            {/* Preview Description */}
            <div className="mb-6 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-sm text-white/80 leading-relaxed">{template.preview.description}</p>
            </div>

            {/* Default Settings */}
            <div className="space-y-3">
              {template.defaults.stampCount && (
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>{template.defaults.stampCount} stamps for reward</span>
                </div>
              )}
              {template.defaults.pointsRate && (
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>{template.defaults.pointsRate}x points rate</span>
                </div>
              )}
              {template.defaults.discountTiers && (
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>{template.defaults.discountTiers.join('%, ')}% discounts</span>
                </div>
              )}
            </div>
          </div>

          {/* Select Button */}
          <Button
            onClick={handleSelect}
            className="w-full mt-6 h-12 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm group/btn font-medium text-base"
          >
            <span>Use This Template</span>
            <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

