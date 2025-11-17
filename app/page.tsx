"use client";

import React, { useRef } from 'react';
import { 
  QrCode, Smartphone, Gift, TrendingUp, Users, Bell, Heart, 
  Rocket, Shield, Globe, Award, Zap, Sparkles, Star, Clock, Store,
  CheckCircle2, ArrowRight, BarChart3, Target, Lock, Zap as ZapIcon
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Import components
import { AnimatedGradient } from '@/components/landing/animated-gradient';
import { ParticleBackground } from '@/components/landing/particle-background';
import { HeroSection } from '@/components/landing/hero-section';
import { GlassCard } from '@/components/landing/glass-card';
import { FeatureCard } from '@/components/landing/feature-card';
import { AnimatedCounter } from '@/components/landing/animated-counter';
import { FAQItem } from '@/components/landing/faq-item';
import { FloatingCard } from '@/components/landing/floating-card';

// Stats Section Component
function StatsSection() {
  const stats = [
    { value: 1000, suffix: "+", label: "Entreprises", icon: Store, color: "from-blue-500 to-cyan-500" },
    { value: 50000, suffix: "+", label: "Clients Actifs", icon: Users, color: "from-purple-500 to-pink-500" },
    { value: 98, suffix: "%", label: "Satisfaction", icon: Star, color: "from-amber-500 to-orange-500" },
    { value: 24, suffix: "/7", label: "Support", icon: Clock, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent dark:via-blue-950/20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Des Résultats
            </span>
            <span className="text-gray-900 dark:text-white"> Qui Parlent</span>
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={idx} delay={idx * 0.1} hover className="p-8 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex p-4 rounded-2xl mb-4 bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </motion.div>
                <div className={`text-5xl font-extrabold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">{stat.label}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: <QrCode className="h-8 w-8 text-white" />,
      title: "Scan QR Instantané",
      description: "Les clients scannent simplement un code QR pour rejoindre votre programme de fidélité en quelques secondes. Aucune application à télécharger.",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-white" />,
      title: "Portefeuilles Numériques",
      description: "Intégration native avec Apple Wallet et Google Pay. Vos clients gardent leurs cartes toujours à portée de main.",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      icon: <Gift className="h-8 w-8 text-white" />,
      title: "Récompenses Flexibles",
      description: "Créez des programmes sur mesure : cartes à tampons, points, réductions progressives. Adaptez tout à votre business.",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      icon: <Bell className="h-8 w-8 text-white" />,
      title: "Notifications Push",
      description: "Envoyez des offres personnalisées, rappels de récompenses et messages promotionnels directement sur le téléphone de vos clients.",
      gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      title: "Analytics Avancés",
      description: "Suivez vos performances en temps réel : taux de conversion, clients actifs, revenus générés par la fidélisation.",
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Programme de Parrainage",
      description: "Encouragez vos clients à inviter leurs amis avec des récompenses automatiques pour le parrain et le filleul.",
      gradient: "bg-gradient-to-br from-red-500 to-red-600",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6"
          >
            <ZapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Fonctionnalités
            </span>
            <span className="text-gray-900 dark:text-white"> Puissantes</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Tout ce dont vous avez besoin pour créer et gérer un programme de fidélité moderne et performant
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              {...feature}
              delay={idx * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Créez Votre Carte",
      description: "Choisissez un modèle, personnalisez les couleurs et le design en quelques clics. Aucune compétence technique requise.",
      icon: <Rocket className="h-12 w-12" />,
      color: "from-blue-500 to-blue-600",
      features: ["Modèles pré-conçus", "Personnalisation complète", "Aperçu en temps réel"]
    },
    {
      step: "02",
      title: "Distribuez le QR Code",
      description: "Téléchargez votre QR code et affichez-le dans votre établissement. Vos clients scannent et ajoutent la carte à leur portefeuille.",
      icon: <QrCode className="h-12 w-12" />,
      color: "from-purple-500 to-purple-600",
      features: ["QR Code haute qualité", "Lien de partage", "Intégration facile"]
    },
    {
      step: "03",
      title: "Gérez & Analysez",
      description: "Utilisez l'application scanner pour ajouter des tampons/points. Consultez vos analytics et envoyez des notifications push.",
      icon: <TrendingUp className="h-12 w-12" />,
      color: "from-pink-500 to-pink-600",
      features: ["Scanner intuitif", "Analytics détaillés", "Notifications automatiques"]
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-gradient-to-b from-white/50 via-blue-50/30 to-white/50 dark:from-gray-800/50 dark:via-blue-950/20 dark:to-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="text-gray-900 dark:text-white">Comment</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Ça Marche</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            En 3 étapes simples, transformez votre fidélisation client
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Animated connection line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2 rounded-full"
          />
          
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="relative"
            >
              <GlassCard className="p-8 lg:p-10 text-center h-full hover">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex p-5 rounded-2xl mb-6 bg-gradient-to-br ${item.color} shadow-xl`}
                >
                  <div className="text-white">{item.icon}</div>
                </motion.div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 tracking-wider">
                  ÉTAPE {item.step}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                  {item.description}
                </p>
                <ul className="space-y-2 text-left">
                  {item.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Trust Indicators Section
function TrustSection() {
  const trustItems = [
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Sécurisé & Conforme",
      description: "Données cryptées AES-256, conformité RGPD. Vos informations et celles de vos clients sont protégées.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "100% Digital",
      description: "Fini les cartes papier ! Une solution écologique et moderne qui s'adapte à tous les smartphones.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Support Dédié",
      description: "Notre équipe vous accompagne dans la mise en place et l'optimisation de votre programme de fidélité.",
      gradient: "from-amber-500 to-orange-500"
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {trustItems.map((item, idx) => (
            <GlassCard key={idx} delay={idx * 0.1} hover className="p-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br ${item.gradient} shadow-lg`}
              >
                <div className="text-white">{item.icon}</div>
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {item.description}
              </p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "Comment DopeCard se différencie-t-il des autres programmes de fidélité ?",
      answer: "DopeCard est la première solution au Maroc à offrir une intégration complète avec les portefeuilles numériques (Apple Wallet & Google Pay), un système de QR code avancé, et une personnalisation poussée pour les entreprises locales. Aucune application à télécharger pour vos clients."
    },
    {
      question: "Est-ce que DopeCard est compatible avec tous les smartphones ?",
      answer: "Oui, DopeCard est compatible avec tous les smartphones modernes, qu'ils soient sous iOS ou Android. Notre technologie s'adapte automatiquement à tous les appareils pour une expérience utilisateur optimale."
    },
    {
      question: "Quels types d'entreprises peuvent utiliser DopeCard ?",
      answer: "DopeCard est idéal pour les restaurants, cafés, boutiques, salons de coiffure, car-wash, spas, et tout type de commerce de détail souhaitant fidéliser sa clientèle. Notre solution s'adapte à la taille et aux besoins spécifiques de chaque entreprise."
    },
    {
      question: "Combien de temps faut-il pour mettre en place un programme ?",
      answer: "Moins de 15 minutes ! Créez votre carte, personnalisez le design, téléchargez le QR code et commencez à fidéliser vos clients immédiatement. Aucune compétence technique requise."
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer: "Non, notre tarification est transparente. Commencez gratuitement avec 1 carte active et des fonctionnalités illimitées. Passez à un plan payant uniquement si vous avez besoin de plus de cartes ou de fonctionnalités avancées."
    },
    {
      question: "Puis-je personnaliser les récompenses selon mes besoins ?",
      answer: "Absolument ! DopeCard offre une flexibilité totale : cartes à tampons (2-50), systèmes de points, réductions progressives, et bien plus. Vous définissez les règles de votre programme de fidélité."
    },
  ];

  return (
    <section id="faq" className="py-24 relative bg-gradient-to-b from-white/50 via-blue-50/30 to-white/50 dark:from-gray-800/50 dark:via-blue-950/20 dark:to-gray-800/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
            <span className="text-gray-900 dark:text-white"> Fréquentes</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tout ce que vous devez savoir sur DopeCard
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-8"
          >
            <div className="p-6 rounded-full bg-white/20 backdrop-blur-md">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
            Prêt à Révolutionner
            <br />
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Votre Fidélisation Client ?
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Rejoignez des centaines d'entreprises qui font confiance à DopeCard pour transformer leur relation client et augmenter leurs revenus.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-7 text-xl font-semibold rounded-2xl shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                Commencer Gratuitement
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="h-6 w-6" />
                </motion.div>
              </span>
            </Button>
          </motion.div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Aucune carte bancaire requise</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Configuration en 15 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Support 24/7</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      <AnimatedGradient />
      <ParticleBackground />
      
      <main className="relative z-10">
        {/* Hero Section with Parallax */}
        <motion.section
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative min-h-screen"
        >
          <HeroSection />
        </motion.section>

        {/* Stats Section */}
        <StatsSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Trust Indicators */}
        <TrustSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <FinalCTASection />
      </main>
    </div>
  );
}
