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
        if (!platform || platform === "unknown") {
            form.setError("root", { message: "Platform not detected." });
            setDownloadState("error");
            return;
        }


        console.log("Form submission initiated with values:", values);
        setDownloadState("downloading"); // Start the transition


        createUser.mutate({ ...values, platform }, {
            onSuccess(data) {
                // Log the entire data object
                console.log("The data is:", data);

                if (platform === 'ios') {
                    // Handle iOS pass download
                    const downloadLink = data.downloadLink;
                    console.log("Download link:", downloadLink);

                    // Extract filename from the UploadThing URL
                    const urlParts = new URL(downloadLink);
                    const pathnameParts = urlParts.pathname.split("/");
                    const fileName = pathnameParts[pathnameParts.length - 1];
                    console.log("Filename", fileName);

                    // Create a link element for downloading
                    const a = document.createElement("a");
                    a.href = downloadLink;
                    a.download = fileName;
                    document.body.appendChild(a);

                    console.log("Initiating download from URL...");
                    a.click();

                    document.body.removeChild(a);

                    console.log("Download initiated from URL and link removed from DOM.");
                    setDownloadState("success");

                } else if (platform === 'android') {
                    const googlePassLink = Buffer.from(data.passBuffer).toString('utf-8')
                    console.log('Google Pass Link:', googlePassLink);
                    window.location.href = googlePassLink;
                    setDownloadState("success");
                }

            },
            onError(error) {
                form.setError("root", {
                    message: "Erreur lors de la création de l'utilisateur. Veuillez réessayer.",
                });
                console.error("Error during user creation:", error);
                setDownloadState("error");
            },
        });

        console.log("Pass creation process finished.");
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