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
import { useState } from "react";


const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50),
  phoneNumber: z.string(),
});

export default function LoginForm() {
  const createUser = trpc.users.create.useMutation();
  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isDownloading) return;

    console.log("Form submission initiated with values:", values);
    setIsDownloading(true);

    createUser.mutate(values, {
      onSuccess(data) {
           // Log the entire data object
            console.log('The data is:', data);
            
             // Log the download link
            const downloadLink = data.downloadLink;
            console.log('Download link:', downloadLink);
        
            // Extract filename from the UploadThing URL
             const urlParts = new URL(downloadLink);
            const pathnameParts = urlParts.pathname.split('/');
            const fileName = pathnameParts[pathnameParts.length - 1];
            console.log("Filename", fileName)
        
        
            // Create a link element for downloading
            const a = document.createElement("a");
            a.href = downloadLink;
            a.download = fileName; // Use the extracted filename
            document.body.appendChild(a);
        
            console.log('Initiating download from URL...');
            a.click();
        
            document.body.removeChild(a); // Remove from the DOM
        
            console.log('Download initiated from URL and link removed from DOM.');
        
        setIsDownloading(false);
      },
      onError(error) {
         form.setError("root", { message: "Error creating user. Please try again." });
         console.error("Error during user creation:", error);
        setIsDownloading(false);
      },
    });

    console.log("Pass creation process finished.");
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

              <Button
                disabled={isDownloading || createUser.isLoading}
                className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                {isDownloading || createUser.isLoading ? "Téléchargement en cours..." : "S'inscrire"}
              </Button>
              <FormMessage/>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}