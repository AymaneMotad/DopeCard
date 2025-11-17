"use client";

import { use } from "react";
import { trpc } from "@/server/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Apple, Smartphone } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50),
  phoneNumber: z.string(),
});

type DownloadState = "idle" | "downloading" | "success" | "error";

export default function RegisterPage({ params }: { params: Promise<{ cardId: string }> | { cardId: string } }) {
  // Handle both Promise and direct object params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [platform, setPlatform] = useState<string | null>("unknown");
  const [isClient, setIsClient] = useState(false);
  const [hasGoogleWallet, setHasGoogleWallet] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const { data: card, isLoading: isLoadingCard, error: cardError } = trpc.cards.getByIdPublic.useQuery(
    { id: resolvedParams.cardId },
    { retry: false } // Don't retry if card not found
  );
  const createUser = trpc.users.create.useMutation({
    onSuccess: async (data) => {
      console.log('Registration successful, platform:', platform);
      console.log('Pass data:', data.passData);
      
      if (platform === 'ios') {
        try {
          const binaryData = atob(data.passData.buffer);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: data.passData.mimeType });
          const url = window.URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pass.pkpass';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setDownloadState("success");
        } catch (error) {
          console.error('Error downloading iOS pass:', error);
          setDownloadState("error");
        }
      } else if (platform === 'android') {
        if (hasGoogleWallet !== false && data.passData.buffer && data.passData.buffer.startsWith('http')) {
          // Google Wallet URL - redirect to Google Wallet
          try {
            window.location.href = data.passData.buffer;
            setDownloadState("success");
          } catch (error) {
            console.error('Error redirecting to Google Wallet:', error);
            setDownloadState("error");
          }
        } else if (hasGoogleWallet === false) {
          // Android without Google Wallet - use PWA fallback
          try {
            // Generate PWA pass URL
            const baseUrl = window.location.origin;
            const pwaUrl = `${baseUrl}/cards/${data.user.id}?template=${resolvedParams.cardId}`;
            
            // Try to trigger PWA install prompt if available
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              console.log('PWA install prompt outcome:', outcome);
              setDeferredPrompt(null);
            }
            
            // Redirect to PWA card page
            window.location.href = pwaUrl;
            setDownloadState("success");
          } catch (error) {
            console.error('Error setting up PWA:', error);
            setDownloadState("error");
          }
        } else {
          // Fallback: try to redirect anyway
          try {
            if (data.passData.buffer && data.passData.buffer.startsWith('http')) {
              window.location.href = data.passData.buffer;
            } else {
              throw new Error('No valid pass URL available');
            }
            setDownloadState("success");
          } catch (error) {
            console.error('Error with Android pass:', error);
            setDownloadState("error");
          }
        }
      } else {
        // Unknown platform - try to detect from pass data or provide download link
        console.warn('Unknown platform, attempting fallback download');
        if (data.passData.mimeType === 'application/vnd.apple.pkpass') {
          // iOS pass on unknown platform - still try to download
          try {
            const binaryData = atob(data.passData.buffer);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            
            const blob = new Blob([bytes], { type: data.passData.mimeType });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pass.pkpass';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            setDownloadState("success");
          } catch (error) {
            console.error('Error downloading pass:', error);
            setDownloadState("error");
          }
        } else if (data.passData.buffer && data.passData.buffer.startsWith('http')) {
          // Android pass URL
          window.location.href = data.passData.buffer;
          setDownloadState("success");
        } else {
          console.error('Unknown platform and cannot determine pass type');
          setDownloadState("error");
        }
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
      setDownloadState("error");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const userAgent = navigator.userAgent.toLowerCase();
      const fullUserAgent = navigator.userAgent;
      console.log('User agent:', userAgent);
      console.log('Full user agent:', fullUserAgent);
      console.log('Max touch points:', navigator.maxTouchPoints);
      
      // Detect iOS (including macOS Safari/Chrome for testing)
      if (
        userAgent.includes('iphone') ||
        userAgent.includes('ipad') ||
        userAgent.includes('ipod') ||
        userAgent.includes('mac os x') ||
        userAgent.includes('macintosh') ||
        (userAgent.includes('mac') && navigator.maxTouchPoints > 0) ||
        userAgent.includes('like mac os x')
      ) {
        console.log('Platform detected: iOS (or macOS for testing)');
        setPlatform('ios');
        setHasGoogleWallet(false); // iOS doesn't have Google Wallet
      } 
      // Detect Android
      else if (userAgent.includes('android')) {
        console.log('Platform detected: Android');
        setPlatform('android');
        
        // Check if Google Wallet is available
        // Google Wallet requires Google Play Services and is typically available on Android devices
        // with Chrome browser. We check for:
        // 1. Chrome browser (most Android devices have it)
        // 2. Mobile device (not desktop)
        // 3. Not in a WebView without proper context
        
        const isChrome = fullUserAgent.includes('Chrome') && !fullUserAgent.includes('Edg');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(fullUserAgent);
        const isWebView = userAgent.includes('wv') && !fullUserAgent.includes('Chrome');
        
        // Google Wallet is generally available on Android with Chrome
        // If it's a WebView without Chrome, it might not have Google Wallet
        const googleWalletAvailable = isChrome && isMobile && !isWebView;
        
        setHasGoogleWallet(googleWalletAvailable);
        console.log('Google Wallet available:', googleWalletAvailable);
        console.log('Chrome:', isChrome, 'Mobile:', isMobile, 'WebView:', isWebView);
      } 
      // Unknown/Desktop - default to iOS for testing purposes
      else {
        console.log('Platform detected: Unknown (desktop or other) - defaulting to iOS for testing');
        setPlatform('ios'); // Default to iOS for desktop testing
        setHasGoogleWallet(false);
      }

      // Listen for PWA install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        console.log('PWA install prompt available');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, [isClient]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (downloadState !== "idle") return;
    
    if (!card) {
      alert('Card not found. Please scan a valid QR code.');
      return;
    }
    
    console.log('Submitting registration with platform:', platform);
    console.log('Card ID:', resolvedParams.cardId);
    
    setDownloadState("downloading");
    
    createUser.mutate({
      ...values,
      platform: platform as 'ios' | 'android' | 'unknown',
      templateId: resolvedParams.cardId, // Use card ID as template ID
    });
  }

  const cardSettings = card?.settings as any;
  const cardDesign = card?.design as any;
  
  // Show loading state while card is being fetched
  if (isLoadingCard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if card not found or not active
  if (cardError || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-red-600">
              Card Not Found
            </CardTitle>
            <CardDescription className="text-center mt-2">
              {cardError?.message || 'The card you are looking for does not exist or is not active.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              Please check the QR code or link and try again. If the problem persists, contact the business.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const businessName = cardSettings?.businessName || card.name || 'Join Our Loyalty Program';
  const cardTitle = card.name || 'Loyalty Card';
  const description = cardSettings?.description || `Join ${businessName} and start earning rewards!`;
  const backgroundColor = cardDesign?.backgroundColor || '#59341C';
  const textColor = cardDesign?.textColor || '#FFFFFF';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="mx-auto max-w-sm w-full shadow-lg">
        <CardHeader 
          className="text-white rounded-t-lg"
          style={{ 
            backgroundColor: backgroundColor,
            color: textColor 
          }}
        >
          <CardTitle className="text-2xl text-center font-bold">
            {businessName}
          </CardTitle>
          <CardDescription 
            className="text-center mt-2"
            style={{ color: textColor, opacity: 0.9 }}
          >
            {cardTitle}
          </CardDescription>
          <p className="text-center mt-2 text-sm" style={{ color: textColor, opacity: 0.8 }}>
            {description}
          </p>
        </CardHeader>
        <CardContent>
          {downloadState === "idle" && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={!isClient || createUser.isLoading}
                  className={`w-full ${
                    platform === "ios" 
                      ? "bg-black text-white hover:bg-gray-800" 
                      : platform === "android" && hasGoogleWallet === true
                      ? "bg-[#4285F4] text-white hover:bg-[#357AE8]"
                      : platform === "android" && hasGoogleWallet === false
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : ""
                  }`}
                >
                  {createUser.isLoading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Skeleton className="h-4 w-4 rounded" />
                      <span>Creating...</span>
                    </div>
                  ) : !isClient ? (
                    "Register"
                  ) : platform === "ios" ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Apple className="h-5 w-5" />
                      <span>Add to Apple Wallet</span>
                    </div>
                  ) : platform === "android" && hasGoogleWallet === true ? (
                    <div className="flex items-center gap-2 justify-center">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Add to Google Wallet</span>
                    </div>
                  ) : platform === "android" && hasGoogleWallet === false ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Smartphone className="h-5 w-5" />
                      <span>Install Wallet App</span>
                    </div>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </Form>
          )}
          {downloadState === "downloading" && (
            <div className="text-center p-4">
              <p className="text-blue-600 font-medium">
                Creating your card...
              </p>
            </div>
          )}
          {downloadState === "success" && (
            <div className="text-center p-4 space-y-2">
              <p className="text-green-600 font-medium">
                {platform === 'ios'
                  ? 'Card added to Apple Wallet!'
                  : platform === 'android'
                  ? 'Card added to Google Wallet!'
                  : 'Card downloaded! Please open it on your mobile device.'}
              </p>
              {platform === 'unknown' && (
                <p className="text-sm text-muted-foreground">
                  For the best experience, please scan the QR code on your iPhone or Android device.
                </p>
              )}
            </div>
          )}
          {downloadState === "error" && (
            <div className="text-center p-4">
              <p className="text-red-600 font-medium">
                Error creating card. Please try again.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check the browser console for more details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

