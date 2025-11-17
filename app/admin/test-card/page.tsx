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
  Gift,
  Ticket,
  CreditCard,
  Users,
  Award,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
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
    cardType: "stamp" as "stamp" | "points" | "discount" | "cashback" | "multipass" | "coupon" | "reward" | "membership" | "gift",
    expiration: "unlimited",
    startDate: "",
    endDate: "",
    stampCount: 10,
    initialStamps: 0,
    pointsRate: 1,
    pointsBalance: 0,
    discountTiers: [5, 10, 15],
    discountPercentage: 0,
    cashbackPercentage: 0,
    cashbackEarned: 0,
    balance: 0,
    visits: 0,
    classesPerMonth: 0,
    expirationDate: "",
    offerDescription: "",
    backgroundColor: "#59341C",
    textColor: "#FFFFFF",
    accentColor: "#FF8C00",
    cardTitle: "Test Loyalty Card",
    businessName: "Test Business",
    subtitle: "Member",
    description: "",
    // Platform selection
    platformAppleWallet: true,
    platformGoogleWallet: true,
    platformPWA: false,
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

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const createCard = trpc.cards.create.useMutation();
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
        <div className="space-y-8">
          <div>
            <Label className="text-lg font-semibold mb-4 block">Card Type</Label>
            <Select
              value={formData.cardType}
              onValueChange={(value) => handleInputChange("cardType", value)}
            >
              <SelectTrigger className="h-12">
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
                <SelectItem value="cashback">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Cashback Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="multipass">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Multipass Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="coupon">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Coupon Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="reward">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Reward Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="membership">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Membership Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="gift">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span>Gift Card</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-4 block">Card Expiration</Label>
            <RadioGroup
              value={formData.expiration}
              onValueChange={(value) => handleInputChange("expiration", value)}
              className="flex space-x-6"
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
            <div className="flex space-x-6">
              <div className="flex-1">
                <Label htmlFor="startDate" className="font-medium mb-2 block">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="font-medium mb-2 block">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          )}

          {formData.cardType === "stamp" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-4 block">
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
                  className="mt-4"
                />
                <div className="text-center mt-4 font-semibold text-lg">
                  {formData.stampCount} stamps
                </div>
              </div>
              <div>
                <Label className="text-lg font-semibold mb-4 block">
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
                  className="mt-4"
                />
                <div className="text-center mt-4 font-semibold text-lg">
                  {formData.initialStamps} stamps
                </div>
              </div>
            </>
          )}

          {formData.cardType === "points" && (
            <div>
              <Label className="text-lg font-semibold mb-4 block">
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
                className="mt-4"
              />
              <div className="text-center mt-4 font-semibold text-lg">
                {formData.pointsRate}x points rate
              </div>
            </div>
          )}

          {formData.cardType === "discount" && (
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Discount Percentage (%)
              </Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[formData.discountPercentage]}
                onValueChange={(value) =>
                  handleInputChange("discountPercentage", value[0])
                }
                className="mt-4"
              />
              <div className="text-center mt-4 font-semibold text-lg">
                {formData.discountPercentage}% discount
              </div>
            </div>
          )}

          {formData.cardType === "cashback" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Cashback Percentage (%)
                </Label>
                <Slider
                  min={0}
                  max={100}
                  step={0.5}
                  value={[formData.cashbackPercentage]}
                  onValueChange={(value) =>
                    handleInputChange("cashbackPercentage", value[0])
                  }
                  className="mt-2"
                />
                <div className="text-center mt-2 font-medium">
                  {formData.cashbackPercentage}% cashback
                </div>
              </div>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Cashback Earned (£)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.cashbackEarned}
                  onChange={(e) =>
                    handleInputChange("cashbackEarned", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </>
          )}

          {formData.cardType === "multipass" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Total Visits
                </Label>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[formData.stampCount]}
                  onValueChange={(value) =>
                    handleInputChange("stampCount", value[0])
                  }
                  className="mt-2"
                />
                <div className="text-center mt-2 font-medium">
                  {formData.stampCount} visits
                </div>
              </div>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Visits Used
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
                  {formData.initialStamps} visits used
                </div>
              </div>
            </>
          )}

          {formData.cardType === "coupon" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Offer Description
                </Label>
                <Input
                  type="text"
                  value={formData.offerDescription}
                  onChange={(e) =>
                    handleInputChange("offerDescription", e.target.value)
                  }
                  placeholder="e.g., Free stretching class every Tuesday"
                />
              </div>
              {formData.expiration === "timeRange" && formData.endDate && (
                <div>
                  <Label className="text-lg font-semibold mb-2">
                    Expiration Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      handleInputChange("endDate", e.target.value);
                      handleInputChange("expirationDate", e.target.value);
                    }}
                  />
                </div>
              )}
            </>
          )}

          {formData.cardType === "reward" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Points Balance
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.pointsBalance}
                  onChange={(e) =>
                    handleInputChange("pointsBalance", parseInt(e.target.value) || 0)
                  }
                />
              </div>
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
            </>
          )}

          {formData.cardType === "membership" && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-2">
                  Classes Per Month
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.classesPerMonth}
                  onChange={(e) =>
                    handleInputChange("classesPerMonth", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              {formData.expiration === "timeRange" && formData.endDate && (
                <div>
                  <Label className="text-lg font-semibold mb-2">
                    Valid Until
                  </Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      handleInputChange("endDate", e.target.value);
                      handleInputChange("expirationDate", e.target.value);
                    }}
                  />
                </div>
              )}
            </>
          )}

          {formData.cardType === "gift" && (
            <div>
              <Label className="text-lg font-semibold mb-2">
                Gift Card Balance (£)
              </Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={formData.balance}
                onChange={(e) =>
                  handleInputChange("balance", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          )}

          {/* Platform Selection */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Label className="text-lg font-semibold mb-2 block">Platform Support</Label>
            <p className="text-sm text-muted-foreground mb-6">
              Select which platforms customers can use to add this card
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Apple className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="platformAppleWallet" className="font-medium cursor-pointer text-base">
                      Apple Wallet (iOS)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      For iPhone and iPad users
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="platformAppleWallet"
                  checked={formData.platformAppleWallet}
                  onChange={(e) => handleInputChange("platformAppleWallet", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Smartphone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="platformGoogleWallet" className="font-medium cursor-pointer text-base">
                      Google Wallet (Android)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      For Android phone users
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="platformGoogleWallet"
                  checked={formData.platformGoogleWallet}
                  onChange={(e) => handleInputChange("platformGoogleWallet", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Smartphone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="platformPWA" className="font-medium cursor-pointer text-base">
                      PWA (Web App)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fallback for devices without wallet apps
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="platformPWA"
                  checked={formData.platformPWA}
                  onChange={(e) => handleInputChange("platformPWA", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Design",
      content: (
        <div className="space-y-8">
          <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> This test page uses default assets from the project.
              Logo, icon, and images are pre-configured and ready to use.
            </p>
          </div>

          <div>
            <Label
              htmlFor="backgroundColor"
              className="text-lg font-semibold mb-4 block"
            >
              Background Color
            </Label>
            <div className="flex items-center space-x-4 mt-4">
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
            <Label htmlFor="textColor" className="text-lg font-semibold mb-4 block">
              Text Color
            </Label>
            <div className="flex items-center space-x-4 mt-4">
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
            <Label htmlFor="accentColor" className="text-lg font-semibold mb-4 block">
              Accent Color
            </Label>
            <div className="flex items-center space-x-4 mt-4">
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
        <div className="space-y-8">
          <div>
            <Label htmlFor="cardTitle" className="text-lg font-semibold mb-3 block">
              Card Title *
            </Label>
            <Input
              id="cardTitle"
              value={formData.cardTitle}
              onChange={(e) => handleInputChange("cardTitle", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div>
            <Label htmlFor="businessName" className="text-lg font-semibold mb-3 block">
              Business Name *
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div>
            <Label htmlFor="subtitle" className="text-lg font-semibold mb-3 block">
              Subtitle
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="h-11"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-lg font-semibold mb-3 block">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[120px] p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Card description..."
            />
          </div>
        </div>
      ),
    },
    {
      title: "Save & Generate PDF",
      content: (
        <div className="space-y-8">
          <div className="p-5 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Ready to create your card!</strong> Review your settings and generate a PDF with QR code for distribution.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-lg mb-4">Card Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card Type:</span>
                  <span className="font-medium">{formData.cardType.charAt(0).toUpperCase() + formData.cardType.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card Title:</span>
                  <span className="font-medium">{formData.cardTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Name:</span>
                  <span className="font-medium">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platforms:</span>
                  <span className="font-medium">
                    {[
                      formData.platformAppleWallet && 'iOS',
                      formData.platformGoogleWallet && 'Android',
                      formData.platformPWA && 'PWA'
                    ].filter(Boolean).join(', ') || 'None selected'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Your card will be saved to the database</li>
                <li>• A unique registration link will be generated</li>
                <li>• A PDF with QR code will be created for distribution</li>
                <li>• You can download and print the PDF for customers</li>
              </ul>
            </div>

            {/* Test Pass Download Button */}
            <div className="p-6 border rounded-lg bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-lg mb-4">Test Pass Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download a test pass to see exactly how it will look in Apple Wallet or Google Wallet before creating the card.
              </p>
              <Button
                onClick={() => {
                  generateTestPass.mutate({
                    cardType: formData.cardType,
                    stampCount: formData.stampCount,
                    initialStamps: formData.initialStamps,
                    pointsRate: formData.pointsRate,
                    pointsBalance: formData.pointsBalance,
                    discountTiers: formData.discountTiers,
                    discountPercentage: formData.discountPercentage,
                    cashbackPercentage: formData.cashbackPercentage,
                    cashbackEarned: formData.cashbackEarned,
                    balance: formData.balance,
                    visits: formData.visits,
                    classesPerMonth: formData.classesPerMonth,
                    expirationDate: formData.expirationDate,
                    offerDescription: formData.offerDescription,
                    backgroundColor: formData.backgroundColor,
                    textColor: formData.textColor,
                    accentColor: formData.accentColor,
                    cardTitle: formData.cardTitle,
                    businessName: formData.businessName,
                    subtitle: formData.subtitle,
                    description: formData.description,
                    expiration: formData.expiration,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    platform: platform as 'ios' | 'android' | 'unknown',
                  });
                }}
                disabled={generateTestPass.isLoading || !formData.cardTitle || !formData.businessName}
                variant="outline"
                className="w-full"
              >
                {generateTestPass.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Test Pass...</span>
                  </div>
                ) : (
                  "Download Test Pass"
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                This will generate and download an actual {platform === 'ios' ? 'Apple Wallet' : platform === 'android' ? 'Google Wallet' : 'wallet'} pass with the current settings for testing purposes.
              </p>
            </div>

            {/* PDF Preview */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-6">PDF Preview</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900">
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
                      {formData.cardTitle}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="px-6 pb-4 space-y-2 text-sm" style={{ color: formData.textColor }}>
                    <p className="font-semibold text-base">
                      {formData.cardType === 'stamp' 
                        ? 'Collect stamps to get a reward'
                        : formData.cardType === 'points'
                        ? 'Collect points to get a reward'
                        : 'Join our loyalty program'}
                    </p>
                    <p>Scan QR code by your phone camera</p>
                    <p>and install digital card in Apple Wallet</p>
                    <p>on Phone or Google Pay on Android</p>
                    <p className="pt-2">Get your reward after</p>
                    <p>
                      {formData.cardType === 'stamp'
                        ? `receiving ${formData.stampCount || 10} stamps`
                        : formData.cardType === 'points'
                        ? 'collecting enough points'
                        : 'making more visits'}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="px-6 pb-4 flex flex-col items-center">
                    <div className="bg-white p-3 rounded">
                      {(() => {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                        const previewLink = `${baseUrl}/register/test-${formData.cardType}-preview`;
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
                        return `${baseUrl}/register/test-${formData.cardType}-preview`;
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
      case 3:
        return "Save card and generate PDF";
      default:
        return "";
    }
  };

  const Stepper = () => (
    <div className="mb-16 relative">
      <div className="flex justify-between mb-4 relative">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center relative z-10 w-1/3"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 dark:bg-gray-800"
              } shadow-lg transition-all duration-300 ease-in-out`}
            >
              {index < currentStep ? (
                <Check className="w-7 h-7" />
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
              className={`mt-5 text-center transition-all duration-300 ease-in-out ${
                index <= currentStep
                  ? "text-primary scale-110"
                  : "text-gray-400"
              }`}
            >
              <h3 className="text-sm font-bold mb-2">{step.title}</h3>
              <span className="text-xs">{getStepDescription(index)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute top-7 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
      <div
        className="absolute top-7 left-0 h-0.5 bg-primary -z-10 transition-all duration-300 ease-in-out"
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

            {/* Clean Card Layout matching high-fidelity designs */}
            <div className="px-4 pt-4 pb-3">
              {/* Card Title & Business Name */}
              <div className="mb-4">
                <h2 className="text-base font-semibold" style={{ color: formData.textColor }}>
                  {formData.cardTitle}
                </h2>
                <p className="text-xs opacity-80" style={{ color: formData.textColor }}>
                  {formData.businessName}
                </p>
              </div>

              {/* Header Fields (Two columns like actual pass) */}
              <div className="pb-3 border-t border-white/10 pt-3">
                <div className="flex justify-between items-start">
                  {/* Left header field */}
                  <div>
                    <p className="text-xs opacity-70" style={{ color: formData.textColor }}>
                      {formData.cardType === "stamp" && "stamps"}
                      {formData.cardType === "points" && "Points balance"}
                      {formData.cardType === "discount" && "Discount percentage"}
                      {formData.cardType === "cashback" && "Cashback percentage"}
                      {formData.cardType === "multipass" && "Visits left"}
                      {formData.cardType === "membership" && "Classes per month"}
                      {formData.cardType === "coupon" && "Valid until"}
                      {formData.cardType === "reward" && "Points balance"}
                      {formData.cardType === "gift" && "Gift card balance"}
                    </p>
                    <p className="text-lg font-semibold mt-1" style={{ color: formData.textColor }}>
                      {formData.cardType === "stamp" && formData.initialStamps}
                      {formData.cardType === "points" && (formData.pointsBalance || 0)}
                      {formData.cardType === "discount" && `${formData.discountPercentage}%`}
                      {formData.cardType === "cashback" && `${formData.cashbackPercentage}%`}
                      {formData.cardType === "multipass" && formData.initialStamps}
                      {formData.cardType === "membership" && formData.classesPerMonth}
                      {formData.cardType === "coupon" && (formData.expirationDate || "N/A")}
                      {formData.cardType === "reward" && (formData.pointsBalance || 0)}
                      {formData.cardType === "gift" && `£${formData.balance || 0}`}
                    </p>
                  </div>
                  {/* Right header field (for stamp cards) */}
                  {formData.cardType === "stamp" && (
                    <div className="text-right">
                      <p className="text-xs opacity-70" style={{ color: formData.textColor }}>
                        rewards
                      </p>
                      <p className="text-lg font-semibold mt-1" style={{ color: formData.textColor }}>
                        0
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Field (Large, centered) - Visual Display */}
              <div className="py-4 border-t border-white/10">
                {(formData.cardType === "stamp" || formData.cardType === "multipass") && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {[...Array(Math.min(formData.stampCount, 10))].map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          i < formData.initialStamps
                            ? 'bg-white/90'
                            : 'bg-white/20'
                        }`}
                        style={{ 
                          backgroundColor: i < formData.initialStamps ? formData.accentColor : undefined 
                        }}
                      >
                        <div className="text-xs">●</div>
                      </div>
                    ))}
                  </div>
                )}
                {formData.cardType === "points" && (
                  <p className="text-center text-base" style={{ color: formData.textColor }}>
                    Earn {formData.pointsRate} pts per £1
                  </p>
                )}
                {formData.cardType === "discount" && (
                  <p className="text-center text-lg font-semibold" style={{ color: formData.textColor }}>
                    {formData.subtitle || "Bronze"}
                  </p>
                )}
                {formData.cardType === "cashback" && (
                  <p className="text-center text-base" style={{ color: formData.textColor }}>
                    £{formData.cashbackEarned?.toFixed(2) || "0.00"} earned
                  </p>
                )}
                {formData.cardType === "membership" && (
                  <p className="text-center text-lg font-semibold" style={{ color: formData.textColor }}>
                    {formData.subtitle || "Gold"}
                  </p>
                )}
                {formData.cardType === "coupon" && (
                  <p className="text-center text-base" style={{ color: formData.textColor }}>
                    {formData.offerDescription || "Special Offer"}
                  </p>
                )}
                {formData.cardType === "reward" && (
                  <p className="text-center text-base" style={{ color: formData.textColor }}>
                    £1 = {formData.pointsRate} pts
                  </p>
                )}
                {formData.cardType === "gift" && (
                  <p className="text-center text-lg font-semibold" style={{ color: formData.textColor }}>
                    Gift Card
                  </p>
                )}
              </div>

              {/* Secondary Field (Minimal info) */}
              <div className="pt-3 pb-2 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="opacity-70" style={{ color: formData.textColor }}>
                      {formData.subtitle || "Member"}
                    </p>
                    <p className="font-semibold mt-1" style={{ color: formData.textColor }}>
                      {formData.cardType === "stamp" && `${Math.max(0, formData.stampCount - formData.initialStamps)} more`}
                      {formData.cardType === "points" && `${100 - (formData.pointsBalance || 0)} more`}
                      {formData.cardType === "multipass" && `${formData.initialStamps} of ${formData.stampCount}`}
                      {formData.cardType === "membership" && `Valid until ${formData.expirationDate || "N/A"}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Section - Smaller, cleaner */}
            <div className="bg-white px-4 py-3">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded">
                  <QRCodeSVG value="TEST" size={100} />
                </div>
                <p className="text-xs text-gray-600 mt-2">Scan at checkout</p>
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

  const handleGenerate = async () => {
    setIsGeneratingPDF(true);
    try {
      // First, create the card in the database
      const cardResult = await createCard.mutateAsync({
        type: 'loyalty', // Apple Wallet pass type
        cardType: formData.cardType,
        name: formData.cardTitle,
        businessName: formData.businessName,
        description: formData.description,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        accentColor: formData.accentColor,
        logo: DEFAULT_ASSETS.logo,
        icon: DEFAULT_ASSETS.icon,
        expiration: formData.expiration === 'unlimited' ? 'none' : formData.expiration,
        stampCount: formData.cardType === 'stamp' ? formData.stampCount : undefined,
        pointsRate: formData.cardType === 'points' ? formData.pointsRate : undefined,
        discountTiers: formData.cardType === 'discount' ? formData.discountTiers : undefined,
        discountPercentage: formData.cardType === 'discount' ? formData.discountPercentage : undefined,
        cashbackPercentage: formData.cardType === 'cashback' ? formData.cashbackPercentage : undefined,
        balance: formData.cardType === 'gift' ? formData.balance : undefined,
        classesPerMonth: formData.cardType === 'membership' ? formData.classesPerMonth : undefined,
        platformAppleWallet: formData.platformAppleWallet,
        platformGoogleWallet: formData.platformGoogleWallet,
        platformPWA: formData.platformPWA,
        active: true, // Activate the card so it can be accessed publicly
      });

      const cardId = cardResult.card.id;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const registrationLink = `${baseUrl}/register/${cardId}`;

      // Generate PDF with the correct registration link
      const { generateCardPDFWithJSPDF } = await import('@/app/utils/pdf-generator-client');
      await generateCardPDFWithJSPDF({
        cardTitle: formData.cardTitle,
        businessName: formData.businessName,
        cardType: formData.cardType,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        description: formData.description,
        registrationLink,
        stampCount: formData.stampCount || 10,
      });
      
      alert(`Card created successfully!\n\nCard ID: ${cardId}\nRegistration Link: ${registrationLink}\n\nPDF downloaded.`);
    } catch (error: any) {
      console.error('Error creating card or generating PDF:', error);
      alert(`Error: ${error.message || 'Failed to create card or generate PDF'}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/15 dark:from-slate-950 dark:via-blue-950/15 dark:to-purple-950/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700/80 to-purple-700/60 dark:from-slate-100 dark:via-blue-300/80 dark:to-purple-300/60 bg-clip-text text-transparent mb-4">
            Test Card Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and test loyalty cards with default assets. Perfect for quick testing without uploading files.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2 p-8 lg:p-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-y-auto max-h-[calc(100vh-200px)]">
            <Stepper />
            <div className="space-y-8">
              {steps.map((step, index) => (
                <Card key={index} className={index === currentStep ? "" : "hidden"}>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-8">{step.title}</h2>
                    {step.content}
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
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
                    disabled={
                      (currentStep === 0 && !formData.cardType) ||
                      (currentStep === 2 && (!formData.cardTitle || !formData.businessName))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={createCard.isLoading || isGeneratingPDF || !formData.cardTitle || !formData.businessName}
                  >
                    {createCard.isLoading || isGeneratingPDF ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{createCard.isLoading ? 'Saving Card...' : 'Generating PDF...'}</span>
                      </div>
                    ) : (
                      "Save Card & Generate PDF"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-8 lg:p-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center">
            <div className="flex gap-4 mb-6">
              <Button
                variant={previewDevice === "iphone" ? "default" : "outline"}
                size="icon"
                onClick={() => setPreviewDevice("iphone")}
                className="w-14 h-14 rounded-full"
              >
                <Apple className="w-6 h-6" />
              </Button>
              <Button
                variant={previewDevice === "android" ? "default" : "outline"}
                size="icon"
                onClick={() => setPreviewDevice("android")}
                className="w-14 h-14 rounded-full"
              >
                <Smartphone className="w-6 h-6" />
              </Button>
            </div>
            <Card className="p-10 bg-white shadow-xl rounded-2xl">
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

