"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Star,
  Smartphone,
  Apple,
  Check,
  Stamp,
  Coins,
  Percent,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/server/client";
import { useRouter } from "next/navigation";

// Default assets from templates (using the URLs already in the project)
const DEFAULT_ASSETS = {
  icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
  icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
  logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
  logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
  strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
  strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
  strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
  thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
  thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
};

export default function TestCardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [previewDevice, setPreviewDevice] = useState("iphone");
  const [platform, setPlatform] = useState<string | null>("unknown"); // Track platform
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const [formData, setFormData] = useState({
    cardType: "stamp" as "stamp" | "points" | "discount",
    expiration: "unlimited",
    startDate: "",
    endDate: "",
    stampCount: 10,
    initialStamps: 0,
    pointsRate: 1,
    discountTiers: [5, 10, 15],
    backgroundColor: "#59341C",
    textColor: "#FFFFFF",
    accentColor: "#FF8C00",
    cardTitle: "Test Loyalty Card",
    businessName: "Test Business",
    subtitle: "Member",
    description: "",
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect platform on mount (same as Registration)
  useEffect(() => {
    if (isClient) {
      const userAgent = navigator.userAgent.toLowerCase();
      console.log("The user agent is", userAgent);
      if (
        userAgent.includes('iphone') ||
        userAgent.includes('ipad') ||
        userAgent.includes('ipod') ||
        (userAgent.includes('mac') && navigator.maxTouchPoints > 0) ||
        userAgent.includes('like mac os x')
      ) {
        console.log('Client is ios');
        setPlatform('ios');
      } else if (userAgent.includes('android')) {
        setPlatform('android');
      }
    }
  }, [isClient]);

  const generateTestPass = trpc.passes.generateTestPass.useMutation({
    onSuccess: (data) => {
      try {
        // Determine platform from response data if platform is unknown
        const isIOSPass = data.mimeType === 'application/vnd.apple.pkpass' || platform === 'ios' || platform === 'unknown';
        
        if (isIOSPass) {
          // Validate data
          if (!data.buffer || !data.mimeType) {
            throw new Error('Invalid response data');
          }

          // Exact same logic as Registration route - no trimming, direct decode
          console.log('Base64 buffer length:', data.buffer.length);
          console.log('MIME type:', data.mimeType);
          
          const binaryData = atob(data.buffer);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          // Validate buffer size
          if (bytes.length === 0) {
            throw new Error('Reconstructed buffer is empty');
          }

          console.log('Downloading pass. Buffer size:', bytes.length, 'bytes');
          console.log('First 4 bytes:', Array.from(bytes.slice(0, 4)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));
          
          // Exact same blob creation as Registration - must match exactly
          const blob = new Blob([bytes], { type: data.mimeType });
          console.log('Blob created. Size:', blob.size, 'Type:', blob.type);
          
          const url = window.URL.createObjectURL(blob);
          console.log('Object URL created:', url);
          
          // Create download link with proper filename
          const a = document.createElement('a');
          a.href = url;
          // Use a descriptive filename with .pkpass extension
          // Important: Set download attribute BEFORE appending to DOM
          a.download = 'test-pass.pkpass';
          a.style.display = 'none';
          a.setAttribute('download', 'test-pass.pkpass'); // Explicitly set attribute
          
          // Append to DOM before clicking (required for some browsers)
          document.body.appendChild(a);
          console.log('Anchor element created and appended');
          console.log('Download filename set to:', a.download);
          
          // Small delay to ensure DOM is ready, then trigger download
          setTimeout(() => {
              console.log('Attempting download click...');
              a.click();
              console.log('Download click executed');
              
              // Clean up after a short delay
              setTimeout(() => {
                  if (document.body.contains(a)) {
                      document.body.removeChild(a);
                  }
                  window.URL.revokeObjectURL(url);
                  console.log('Cleanup completed');
              }, 1000);
          }, 10);
          
          console.log('Pass download initiated successfully');
        } else if (platform === 'android') {
          // For Android, redirect to Google Pass URL
          window.location.href = data.buffer; // Direct Google Pass URL
        }
      } catch (error) {
        console.error('Error downloading pass:', error);
        alert(`Error downloading pass: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    },
    onError: (error) => {
      console.error('Error generating pass:', error);
      alert(`Error generating pass: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    {
      title: "Card Type & Settings",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-2">Card Type</Label>
            <Select
              value={formData.cardType}
              onValueChange={(value) => handleInputChange("cardType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stamp">
                  <div className="flex items-center gap-2">
                    <Stamp className="h-4 w-4" />
                    <span>Stamp Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="points">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span>Points Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="discount">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    <span>Discount Card</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-2">Card Expiration</Label>
            <RadioGroup
              value={formData.expiration}
              onValueChange={(value) => handleInputChange("expiration", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unlimited" id="unlimited" />
                <Label htmlFor="unlimited" className="font-medium">
                  Unlimited
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="timeRange" id="timeRange" />
                <Label htmlFor="timeRange" className="font-medium">
                  Time Range
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.expiration === "timeRange" && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="startDate" className="font-medium">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="font-medium">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {formData.cardType === "stamp" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Count of Stamps
                </Label>
                <Slider
                  min={2}
                  max={50}
                  step={1}
                  value={[formData.stampCount]}
                  onValueChange={(value) =>
                    handleInputChange("stampCount", value[0])
                  }
                  className="mt-2"
                />
                <div className="text-center mt-2 font-medium">
                  {formData.stampCount} stamps
                </div>
              </div>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Initial Count of Stamps
                </Label>
                <Slider
                  min={0}
                  max={formData.stampCount}
                  step={1}
                  value={[formData.initialStamps]}
                  onValueChange={(value) =>
                    handleInputChange("initialStamps", value[0])
                  }
                  className="mt-2"
                />
                <div className="text-center mt-2 font-medium">
                  {formData.initialStamps} stamps
                </div>
              </div>
            </>
          )}

          {formData.cardType === "points" && (
            <div>
              <Label className="text-lg font-semibold mb-2">
                Points Rate (points per purchase)
              </Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[formData.pointsRate]}
                onValueChange={(value) =>
                  handleInputChange("pointsRate", value[0])
                }
                className="mt-2"
              />
              <div className="text-center mt-2 font-medium">
                {formData.pointsRate}x points rate
              </div>
            </div>
          )}

          {formData.cardType === "discount" && (
            <div>
              <Label className="text-lg font-semibold mb-2">
                Discount Tiers (%)
              </Label>
              <div className="space-y-2">
                <Input
                  type="text"
                  value={formData.discountTiers.join(", ")}
                  onChange={(e) => {
                    const tiers = e.target.value
                      .split(",")
                      .map((t) => parseInt(t.trim()))
                      .filter((t) => !isNaN(t));
                    handleInputChange("discountTiers", tiers);
                  }}
                  placeholder="5, 10, 15"
                />
                <p className="text-sm text-muted-foreground">
                  Enter discount percentages separated by commas
                </p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Design",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> This test page uses default assets from the project.
              Logo, icon, and images are pre-configured and ready to use.
            </p>
          </div>

          <div>
            <Label
              htmlFor="backgroundColor"
              className="text-lg font-semibold mb-2"
            >
              Background Color
            </Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="relative w-16 h-16">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) =>
                    handleInputChange("backgroundColor", e.target.value)
                  }
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                <div
                  className="w-full h-full rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.backgroundColor }}
                  onClick={() => {
                    const colorInput = document.getElementById(
                      "backgroundColor"
                    ) as HTMLInputElement;
                    colorInput?.click();
                  }}
                />
              </div>
              <span className="font-medium">{formData.backgroundColor}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="textColor" className="text-lg font-semibold mb-2">
              Text Color
            </Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="relative w-16 h-16">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => handleInputChange("textColor", e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                <div
                  className="w-full h-full rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.textColor }}
                  onClick={() => {
                    const colorInput = document.getElementById(
                      "textColor"
                    ) as HTMLInputElement;
                    colorInput?.click();
                  }}
                />
              </div>
              <span className="font-medium">{formData.textColor}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="accentColor" className="text-lg font-semibold mb-2">
              Accent Color
            </Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="relative w-16 h-16">
                <Input
                  id="accentColor"
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => handleInputChange("accentColor", e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                <div
                  className="w-full h-full rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.accentColor }}
                  onClick={() => {
                    const colorInput = document.getElementById(
                      "accentColor"
                    ) as HTMLInputElement;
                    colorInput?.click();
                  }}
                />
              </div>
              <span className="font-medium">{formData.accentColor}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Information",
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="cardTitle" className="text-lg font-semibold mb-2">
              Card Title *
            </Label>
            <Input
              id="cardTitle"
              value={formData.cardTitle}
              onChange={(e) => handleInputChange("cardTitle", e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="businessName" className="text-lg font-semibold mb-2">
              Business Name *
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="subtitle" className="text-lg font-semibold mb-2">
              Subtitle
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-lg font-semibold mb-2">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Card description..."
            />
          </div>
        </div>
      ),
    },
  ];

  const getStepDescription = (index: number) => {
    switch (index) {
      case 0:
        return "Configure card type and settings";
      case 1:
        return "Customize appearance";
      case 2:
        return "Add card details";
      default:
        return "";
    }
  };

  const Stepper = () => (
    <div className="mb-12 relative">
      <div className="flex justify-between mb-2 relative">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center relative z-10 w-1/3"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100"
              } shadow-lg transition-all duration-300 ease-in-out`}
            >
              {index < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span
                  className={`text-lg font-bold ${
                    index <= currentStep
                      ? "text-primary-foreground"
                      : "text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>
              )}
            </div>
            <div
              className={`mt-4 text-center transition-all duration-300 ease-in-out ${
                index <= currentStep
                  ? "text-primary scale-110"
                  : "text-gray-400"
              }`}
            >
              <h3 className="text-sm font-bold mb-1">{step.title}</h3>
              <span className="text-xs">{getStepDescription(index)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-10" />
      <div
        className="absolute top-6 left-0 h-0.5 bg-primary -z-10 transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />
    </div>
  );

  const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`relative w-[280px] h-[580px] ${
        previewDevice === "iphone"
          ? 'bg-gray-800 p-2 rounded-[55px] before:content-[""] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-24 before:h-7 before:bg-black before:rounded-b-3xl'
          : "bg-gray-800 p-2"
      } shadow-xl`}
    >
      <div
        className={`w-full h-full bg-white ${
          previewDevice === "iphone" ? "rounded-[48px]" : ""
        } overflow-hidden shadow-inner`}
      >
        {children}
      </div>
    </div>
  );

  const PassPreview = () => {
    // Convert hex to rgb for better color matching
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
        : hex;
    };

    return (
      <div className="h-full bg-gray-100 overflow-y-auto">
        {/* Apple Wallet-style pass preview */}
        <div className="w-full max-w-sm mx-auto mt-4">
          {/* Pass Container */}
          <div
            className="relative overflow-hidden rounded-t-2xl shadow-2xl"
            style={{
              backgroundColor: formData.backgroundColor,
              color: formData.textColor,
            }}
          >
            {/* Strip Image (top banner) */}
            <div className="relative h-24 w-full overflow-hidden">
              <img
                src={DEFAULT_ASSETS.strip}
                alt="Strip"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            </div>

            {/* Logo Section */}
            <div className="absolute top-2 right-4 flex items-center gap-2">
              <img
                src={DEFAULT_ASSETS.logo}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>

            {/* Header Fields */}
            <div className="px-4 pt-2 pb-4">
              <div className="text-center mb-2">
                <h2 className="text-lg font-semibold" style={{ color: formData.textColor }}>
                  {formData.cardTitle}
                </h2>
                <p className="text-xs opacity-90" style={{ color: formData.textColor }}>
                  {formData.businessName}
                </p>
              </div>
            </div>

            {/* Primary Field */}
            <div className="px-4 pb-3 border-t border-white/20">
              <div className="text-center py-2">
                {formData.cardType === "stamp" && (
                  <div>
                    <div className="text-2xl font-bold" style={{ color: formData.textColor }}>
                      {formData.initialStamps}/{formData.stampCount}
                    </div>
                    <div className="text-xs mt-1 opacity-90" style={{ color: formData.textColor }}>
                      STAMPS
                    </div>
                  </div>
                )}
                {formData.cardType === "points" && (
                  <div>
                    <div className="text-2xl font-bold" style={{ color: formData.accentColor }}>
                      {formData.initialStamps * (formData.pointsRate || 1)} PTS
                    </div>
                    <div className="text-xs mt-1 opacity-90" style={{ color: formData.textColor }}>
                      POINTS BALANCE
                    </div>
                  </div>
                )}
                {formData.cardType === "discount" && (
                  <div>
                    <div className="text-2xl font-bold" style={{ color: formData.accentColor }}>
                      {formData.discountTiers[0] || 5}% OFF
                    </div>
                    <div className="text-xs mt-1 opacity-90" style={{ color: formData.textColor }}>
                      NEXT DISCOUNT
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Fields */}
            <div className="px-4 pb-3 border-t border-white/20">
              <div className="flex justify-between text-xs py-2">
                <div>
                  <div className="opacity-70" style={{ color: formData.textColor }}>MEMBER SINCE</div>
                  <div className="font-semibold mt-1" style={{ color: formData.textColor }}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="opacity-70" style={{ color: formData.textColor }}>STATUS</div>
                  <div className="font-semibold mt-1" style={{ color: formData.accentColor }}>
                    {formData.subtitle || 'ACTIVE'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stamps Display (for stamp cards) */}
            {formData.cardType === "stamp" && (
              <div className="px-4 pb-4 border-t border-white/20">
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  {[...Array(formData.stampCount)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        i < formData.initialStamps
                          ? 'bg-white text-black'
                          : 'border-2 border-white/40'
                      }`}
                    >
                      {i < formData.initialStamps ? (
                        <Star className="w-4 h-4 fill-current" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barcode Section */}
            <div className="bg-white px-4 py-4 border-t-2 border-dashed border-white/30">
              <div className="flex flex-col items-center">
                <div className="bg-white p-2 rounded">
                  <QRCodeSVG value="TEST" size={80} />
                </div>
                <p className="text-xs text-gray-600 mt-2">Scan to redeem</p>
              </div>
            </div>
          </div>

          {/* Wallet Footer (iOS style) */}
          <div className="bg-white rounded-b-2xl shadow-2xl px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Apple Wallet</span>
              <span>Tap to view details</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleGenerate = () => {
    generateTestPass.mutate({
      cardType: formData.cardType,
      stampCount: formData.stampCount,
      initialStamps: formData.initialStamps,
      pointsRate: formData.pointsRate,
      discountTiers: formData.discountTiers,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      accentColor: formData.accentColor,
      cardTitle: formData.cardTitle,
      businessName: formData.businessName,
      subtitle: formData.subtitle,
      description: formData.description,
      expiration: formData.expiration,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      platform: platform as 'ios' | 'android' | 'unknown',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/15 dark:from-slate-950 dark:via-blue-950/15 dark:to-purple-950/10">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-700/80 to-purple-700/60 dark:from-slate-100 dark:via-blue-300/80 dark:to-purple-300/60 bg-clip-text text-transparent mb-2">
            Test Card Generator
          </h1>
          <p className="text-muted-foreground">
            Create and test loyalty cards with default assets. Perfect for quick testing without uploading files.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md overflow-y-auto max-h-[calc(100vh-200px)]">
            <Stepper />
            <div className="space-y-6">
              {steps.map((step, index) => (
                <Card key={index} className={index === currentStep ? "" : "hidden"}>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{step.title}</h2>
                    {step.content}
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={generateTestPass.isLoading || !formData.cardTitle || !formData.businessName}
                  >
                    {generateTestPass.isLoading ? "Generating..." : "Generate Test Pass"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <Button
                variant={previewDevice === "iphone" ? "default" : "outline"}
                size="icon"
                onClick={() => setPreviewDevice("iphone")}
                className="w-12 h-12 rounded-full"
              >
                <Apple className="w-6 h-6" />
              </Button>
              <Button
                variant={previewDevice === "android" ? "default" : "outline"}
                size="icon"
                onClick={() => setPreviewDevice("android")}
                className="w-12 h-12 rounded-full"
              >
                <Smartphone className="w-6 h-6" />
              </Button>
            </div>
            <Card className="p-8 bg-white shadow-lg rounded-2xl">
              <PhoneMockup>
                <PassPreview />
              </PhoneMockup>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

