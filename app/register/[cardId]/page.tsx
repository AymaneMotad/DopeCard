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
import { useState, useEffect } from "react";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50),
  phoneNumber: z.string(),
});

type DownloadState = "idle" | "downloading" | "success" | "error";

export default function RegisterPage({ params }: { params: Promise<{ cardId: string }> }) {
  const resolvedParams = use(params);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [platform, setPlatform] = useState<string | null>("unknown");
  const [isClient, setIsClient] = useState(false);

  const { data: card } = trpc.cards.getById.useQuery({ id: resolvedParams.cardId });
  const createUser = trpc.users.create.useMutation({
    onSuccess: (data) => {
      if (platform === 'ios') {
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
      } else if (platform === 'android') {
        window.location.href = data.passData.buffer;
        setDownloadState("success");
      }
    },
    onError: () => {
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
      if (
        userAgent.includes('iphone') ||
        userAgent.includes('ipad') ||
        userAgent.includes('ipod') ||
        (userAgent.includes('mac') && navigator.maxTouchPoints > 0) ||
        userAgent.includes('like mac os x')
      ) {
        setPlatform('ios');
      } else if (userAgent.includes('android')) {
        setPlatform('android');
      }
    }
  }, [isClient]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (downloadState !== "idle") return;
    
    createUser.mutate({
      ...values,
      platform: platform as 'ios' | 'android' | 'unknown',
      templateId: resolvedParams.cardId,
    });
  }

  const cardSettings = card?.settings as any;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {cardSettings?.businessName || 'Join Our Loyalty Program'}
          </CardTitle>
          <CardDescription className="text-center">
            {cardSettings?.description || 'Register now to get your digital loyalty card!'}
          </CardDescription>
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
                  className="w-full"
                >
                  {createUser.isLoading
                    ? "Creating..."
                    : platform === "ios"
                    ? "Add to Apple Wallet"
                    : platform === "android"
                    ? "Add to Google Wallet"
                    : "Register"}
                </Button>
              </form>
            </Form>
          )}
          {downloadState === "success" && (
            <div className="text-center p-4">
              <p className="text-green-600 font-medium">
                {platform === 'ios'
                  ? 'Card added to Apple Wallet!'
                  : 'Card added to Google Wallet!'}
              </p>
            </div>
          )}
          {downloadState === "error" && (
            <div className="text-center p-4">
              <p className="text-red-600 font-medium">
                Error creating card. Please try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

