"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Stamp, Coins, Percent, Apple, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getCardTemplate } from "@/modules/pass-generation/card-templates";

type CardType = 'stamp' | 'points' | 'discount';

export default function CreateCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  // If template is selected, start at step 2 (skip card type selection)
  const [currentStep, setCurrentStep] = useState(templateId ? 2 : 1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Card Type (pre-filled if template selected)
    type: '' as CardType | '',
    
    // Step 2: Settings
    expiration: 'none' as string,
    language: 'en',
    
    // Step 3: Design
    logo: '',
    icon: '',
    backgroundColor: '#59341C',
    textColor: '#FFFFFF',
    accentColor: '#FF8C00',
    
    // Step 4: Information
    name: '',
    businessName: '',
    description: '',
    rewardDetails: {} as Record<string, any>,
    terms: '',
    
    // Step 5: Platform Selection
    platformAppleWallet: true,
    platformGoogleWallet: true,
    platformPWA: false,
    
    // Step 6: Activation
    active: false,
  });

  // Load template data if templateId is provided
  useEffect(() => {
    if (templateId) {
      const template = getCardTemplate(templateId);
      if (template) {
        setSelectedTemplate(template);
        // Pre-populate form data with template defaults
        setFormData(prev => ({
          ...prev,
          type: template.cardType,
          backgroundColor: template.preview.backgroundColor,
          textColor: template.preview.foregroundColor,
          accentColor: template.preview.accentColor,
          rewardDetails: {
            ...prev.rewardDetails,
            ...(template.defaults.stampCount && { stampCount: template.defaults.stampCount }),
            ...(template.defaults.pointsRate && { pointsRate: template.defaults.pointsRate }),
            ...(template.defaults.discountTiers && { discountTiers: template.defaults.discountTiers }),
          },
        }));
      }
    }
  }, [templateId]);

  const createCard = trpc.cards.create.useMutation({
    onSuccess: async (data) => {
      // Generate PDF after card creation
      // Use card ID for registration link (unique to this card)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const registrationLink = `${baseUrl}/register/${data.card.id}`;

      try {
        setIsGeneratingPDF(true);
        // Use client-side PDF generation
        const { generateCardPDFWithJSPDF } = await import('@/app/utils/pdf-generator-client');
        await generateCardPDFWithJSPDF({
          cardId: data.card.id,
          cardTitle: formData.name,
          businessName: formData.businessName,
          cardType: formData.type || 'stamp',
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
          description: formData.description,
          registrationLink,
          stampCount: (formData.rewardDetails as any)?.stampCount || 10,
        });

        // Navigate to card detail page
        router.push(`/cards/${data.card.id}`);
      } catch (error: any) {
        console.error('Error generating PDF:', error);
        // Still navigate even if PDF generation fails
        router.push(`/cards/${data.card.id}`);
      } finally {
        setIsGeneratingPDF(false);
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleNext = () => {
    // When template is selected, we have 5 steps (2, 3, 4, 5, 6)
    // When no template, we have 6 steps (1, 2, 3, 4, 5, 6)
    const maxStep = templateId ? 6 : 6;
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    // If template is selected and we're on step 2, go back to template selection
    if (templateId && currentStep === 2) {
      router.push('/cards');
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.name || !formData.businessName) {
      alert('Please fill in all required fields');
      return;
    }

    // Map formData to match the schema
    createCard.mutate({
      ...formData,
      type: 'loyalty', // Apple Wallet pass type - always 'loyalty' for storeCard
      cardType: formData.type, // Business card type
      platformAppleWallet: formData.platformAppleWallet,
      platformGoogleWallet: formData.platformGoogleWallet,
      platformPWA: formData.platformPWA,
    } as any);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Card</CardTitle>
          <CardDescription>
            {selectedTemplate && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm text-blue-700 dark:text-blue-300">
                Using template: <strong>{selectedTemplate.name}</strong> ({selectedTemplate.cardType})
              </div>
            )}
            Step {templateId ? currentStep - 1 : currentStep} of {templateId ? 5 : 6}: {
              currentStep === 1 && 'Select Card Type'
            }
            {currentStep === 2 && 'Configure Settings'}
            {currentStep === 3 && 'Customize Design'}
            {currentStep === 4 && 'Add Information'}
            {currentStep === 5 && 'Platform Selection'}
            {currentStep === 6 && 'Save & Generate PDF'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Card Type Selection - Only show if no template selected */}
          {currentStep === 1 && !templateId && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Choose Card Type</h3>
              <p className="text-sm text-muted-foreground">
                Select a card type to create a custom card from scratch, or go back to choose a pre-designed template.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'stamp' })}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.type === 'stamp' ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <Stamp className="h-8 w-8 mb-2" />
                  <h4 className="font-semibold">Stamps Card</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Traditional punch card loyalty program
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'points' })}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.type === 'points' ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <Coins className="h-8 w-8 mb-2" />
                  <h4 className="font-semibold">Points Card</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Accumulate points, exchange for rewards
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'discount' })}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.type === 'discount' ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <Percent className="h-8 w-8 mb-2" />
                  <h4 className="font-semibold">Discount Card</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Progressive discount based on visits
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Card Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expiration">Card Expiration</Label>
                  <Select
                    value={formData.expiration}
                    onValueChange={(value) => setFormData({ ...formData, expiration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No expiration</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Design */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Customize Design</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon URL (for notifications)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="https://example.com/icon.png"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        placeholder="#59341C"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        placeholder="#FF8C00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Card Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Card Title *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Coffee Loyalty Card"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Brew Rewards"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of your loyalty program"
                  />
                </div>

                {formData.type === 'stamp' && (
                  <div>
                    <Label htmlFor="stampCount">Stamps Needed for Reward</Label>
                    <Input
                      id="stampCount"
                      type="number"
                      min="2"
                      max="50"
                      onChange={(e) => setFormData({
                        ...formData,
                        rewardDetails: { ...formData.rewardDetails, stampCount: parseInt(e.target.value) || 10 }
                      })}
                      placeholder="10"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="terms">Terms of Use</Label>
                  <textarea
                    id="terms"
                    className="w-full min-h-[100px] p-2 border rounded"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="Terms and conditions..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Platform Selection */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Platform Support</h3>
              <p className="text-sm text-muted-foreground">
                Select which platforms customers can use to add this card
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Apple className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor="platformAppleWallet" className="font-medium cursor-pointer">
                        Apple Wallet (iOS)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        For iPhone and iPad users
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="platformAppleWallet"
                    checked={formData.platformAppleWallet}
                    onChange={(e) => setFormData({ ...formData, platformAppleWallet: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor="platformGoogleWallet" className="font-medium cursor-pointer">
                        Google Wallet (Android)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        For Android phone users
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="platformGoogleWallet"
                    checked={formData.platformGoogleWallet}
                    onChange={(e) => setFormData({ ...formData, platformGoogleWallet: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor="platformPWA" className="font-medium cursor-pointer">
                        PWA (Web App)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Fallback for devices without wallet apps
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="platformPWA"
                    checked={formData.platformPWA}
                    onChange={(e) => setFormData({ ...formData, platformPWA: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Save & Preview */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review & Activate</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Card Summary</h4>
                  <p><strong>Type:</strong> {formData.type}</p>
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Business:</strong> {formData.businessName}</p>
                  <p><strong>Expiration:</strong> {formData.expiration === 'none' ? 'No expiration' : `${formData.expiration} days`}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <Label htmlFor="active">Activate card immediately</Label>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">PDF Preview</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div 
                    className="mx-auto max-w-md rounded-lg shadow-lg overflow-hidden"
                    style={{
                      backgroundColor: formData.backgroundColor,
                      color: formData.textColor,
                    }}
                  >
                    {/* PDF Header */}
                    <div className="p-6 text-center">
                      <h2 className="text-xl font-bold mb-2" style={{ color: formData.textColor }}>
                        {formData.businessName}
                      </h2>
                      <p className="text-sm opacity-90" style={{ color: formData.textColor }}>
                        {formData.name}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="px-6 pb-4 space-y-2 text-sm" style={{ color: formData.textColor }}>
                      <p className="font-semibold text-base">
                        {formData.type === 'stamp' 
                          ? 'Collect stamps to get a reward'
                          : formData.type === 'points'
                          ? 'Collect points to get a reward'
                          : formData.type === 'discount'
                          ? 'Get progressive discounts'
                          : 'Join our loyalty program'}
                      </p>
                      <p>Scan QR code by your phone camera</p>
                      <p>and install digital card in Apple Wallet</p>
                      <p>on Phone or Google Pay on Android</p>
                      <p className="pt-2">Get your reward after</p>
                      <p>
                        {formData.type === 'stamp'
                          ? `receiving ${(formData.rewardDetails as any)?.stampCount || 10} stamps`
                          : formData.type === 'points'
                          ? 'collecting enough points'
                          : formData.type === 'discount'
                          ? 'making more visits'
                          : 'joining our program'}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="px-6 pb-4 flex flex-col items-center">
                      <div className="bg-white p-3 rounded">
                        {(() => {
                          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                          const previewLink = `${baseUrl}/register/preview-card`;
                          return (
                            <QRCodeSVG 
                              value={previewLink} 
                              size={120}
                              bgColor="#000000"
                              fgColor="#FFFFFF"
                            />
                          );
                        })()}
                      </div>
                      <p className="text-xs mt-3 opacity-80 break-all px-2 text-center" style={{ color: formData.textColor }}>
                        {(() => {
                          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                          return `${baseUrl}/register/preview-card`;
                        })()}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-4 text-center">
                      <p className="text-xs opacity-70" style={{ color: formData.textColor }}>
                        {formData.businessName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 && !templateId}
            >
              {templateId && currentStep === 2 ? 'Back to Templates' : 'Back'}
            </Button>
            
            {currentStep < 6 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.type) ||
                  (currentStep === 4 && (!formData.name || !formData.businessName))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createCard.isLoading || isGeneratingPDF}
              >
                {createCard.isLoading || isGeneratingPDF ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </div>
                ) : (
                  'Create Card & Generate PDF'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

