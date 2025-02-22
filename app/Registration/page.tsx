"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/server/client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';


const formSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2).max(50),
    phoneNumber: z.string(),
});

type DownloadState = "idle" | "downloading" | "success" | "error";

export default function LoginForm() {
    const createUser = trpc.users.create.useMutation();
    const [downloadState, setDownloadState] = useState<DownloadState>("idle");
    const [platform, setPlatform] = useState<string | null>("unknown"); // Track platform
    const [isClient, setIsClient] = useState(false); // Track client-side rendering


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    });


    useEffect(() => {
        setIsClient(true);
    }, []);
    // Detect platform on mount
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
     async function onSubmit(values: z.infer<typeof formSchema>) {
      if (downloadState !== "idle") return;
      
      createUser.mutate({ ...values, platform }, {
          onSuccess(data) {
              if (platform === 'ios') {
                  // Convert base64 back to buffer
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
                  window.location.href = data.passData.buffer; // Direct Google Pass URL
                  setDownloadState("success");
              }
          },
          onError(error) {
              form.setError("root", {
                  message: "Error creating user. Please try again.",
              });
              setDownloadState("error");
          }
      });
  }

    const renderButton = () => {
        if (createUser.isLoading) {
            return (
                <Button disabled className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity">
                   Téléchargement en cours...
                </Button>
            );
        }

       const buttonText = platform === "ios" ? "Add to Apple Wallet" : platform === "android" ? "Add to Google Wallet" : "S'inscrire"
        return(
            <Button
             disabled={!isClient}
             className={cn("w-full px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity",
                platform === "ios" ? "bg-black text-white" : platform === "android" ? "bg-green-600 text-white" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white")}
        
            >
                {buttonText}
           </Button>
        );
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Inscription</CardTitle>
                <CardDescription>
                    Register now, to join your favorite restaurant fidelity system!
                </CardDescription>
            </CardHeader>
            <CardContent>
                {downloadState === "idle" && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom d'utilisateur</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>E-mail</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Numéro du téléphone</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-center">
                                    {renderButton()}
                                </div>
                                <FormMessage />
                            </div>
                        </form>
                    </Form>
                )}
                {downloadState === "downloading" && (
                    <div className="flex items-center justify-center p-4 text-center">
                        <p className="text-lg font-medium text-gray-700 transition-opacity">
                            Votre carte est en préparation...
                        </p>
                    </div>
                )}
                {downloadState === "success" && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        {platform === 'ios' && (
                            <p className="text-lg font-medium text-gray-700 transition-opacity">
                                Votre carte de fidélité est prête ! Veuillez la consulter dans votre portefeuille.
                            </p>
                        )}
                        {platform === 'android' && (
                            <p className="text-lg font-medium text-gray-700 transition-opacity">
                                Votre carte de fidélité est en cours d'enregistrement dans votre Google Wallet...
                            </p>
                        )}
                    </div>
                )}
                {downloadState === "error" && (
                    <div className="flex items-center justify-center p-4 text-center">
                        <p className="text-lg font-medium text-red-700 transition-opacity">
                            Erreur lors de la création de l'utilisateur. Veuillez réessayer.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}