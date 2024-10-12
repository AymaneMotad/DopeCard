import React from 'react';
import { ArrowRight, QrCode, Smartphone, Gift, CheckCircle, Zap } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
    <div className={`mb-4 text-${color}-600`}>{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <div className="border-b border-gray-200 pb-4">
    <h4 className="text-lg font-semibold mb-2">{question}</h4>
    <p className="text-gray-600">{answer}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 animate-fadeIn">
            La Première Solution de Fidélité Avancée au Maroc
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fadeIn">
            DopeCard révolutionne la fidélisation client avec une technologie de pointe, conçue spécialement pour le marché marocain.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Commencer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              En Savoir Plus
            </Button>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-20">
          <h2 className="text-4xl font-bold text-center mb-12">Fonctionnalités Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="h-12 w-12" />}
              title="Scan QR Facile"
              description="Les clients scannent simplement un code QR pour rejoindre votre programme de fidélité instantanément."
              color="blue"
            />
            <FeatureCard
              icon={<Smartphone className="h-12 w-12" />}
              title="Intégration Portefeuille Numérique"
              description="Ajoutez facilement des cartes de fidélité aux portefeuilles Google et Apple pour un accès rapide."
              color="purple"
            />
            <FeatureCard
              icon={<Gift className="h-12 w-12" />}
              title="Récompenses Personnalisables"
              description="Créez des programmes de fidélité attrayants adaptés à votre restaurant et à vos clients."
              color="pink"
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <h2 className="text-4xl font-bold text-center mb-12">Comment Ça Marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <Image
                src="/placeholder.svg?height=600&width=400"
                alt="DopeCard App Mockup"
                width={400}
                height={600}
                className="rounded-lg shadow-2xl mx-auto"
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h3 className="text-3xl font-semibold">Une Expérience Utilisateur Intuitive</h3>
              <p className="text-xl text-gray-600">
                DopeCard offre une interface élégante et facile à utiliser, permettant à vos clients de gérer leurs récompenses et de suivre leurs progrès en toute simplicité.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span>Accès rapide aux cartes de fidélité</span>
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span>Suivi des points et des récompenses en temps réel</span>
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span>Notifications personnalisées pour les offres spéciales</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <h2 className="text-4xl font-bold text-center mb-12">Foire Aux Questions</h2>
          <div className="space-y-8 max-w-3xl mx-auto">
            <FAQItem
              question="Comment DopeCard se différencie-t-il des autres programmes de fidélité ?"
              answer="DopeCard est la première solution au Maroc à offrir une intégration complète avec les portefeuilles numériques, un système de QR code avancé, et une personnalisation poussée pour les entreprises locales."
            />
            <FAQItem
              question="Est-ce que DopeCard est compatible avec tous les smartphones ?"
              answer="Oui, DopeCard est compatible avec tous les smartphones modernes, qu'ils soient sous iOS ou Android. Notre technologie s'adapte à tous les appareils pour une expérience utilisateur optimale."
            />
            <FAQItem
              question="Quels types d'entreprises peuvent utiliser DopeCard ?"
              answer="DopeCard est idéal pour les restaurants, cafés, boutiques, et tout type de commerce de détail souhaitant fidéliser sa clientèle. Notre solution s'adapte à la taille et aux besoins spécifiques de chaque entreprise."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl py-16 px-8">
            <h2 className="text-4xl font-bold text-white mb-8 animate-fadeIn">
              Prêt à Révolutionner Votre Fidélisation Client ?
            </h2>
            <div className="animate-fadeIn">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Commencer Maintenant
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}