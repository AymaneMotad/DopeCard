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

type DownloadState = "idle" | "downloading" | "success" | "error";

export default function LoginForm() {
  const createUser = trpc.users.create.useMutation();
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (downloadState !== "idle") return;

    console.log("Form submission initiated with values:", values);
    setDownloadState("downloading"); // Start the transition
    

    createUser.mutate(values, {
      onSuccess(data) {
        // Log the entire data object
        console.log("The data is:", data);

        // Log the download link
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

                <Button
                  disabled={createUser.isLoading}
                  className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {createUser.isLoading ? "Téléchargement en cours..." : "S'inscrire"}
                </Button>
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
          <div className="flex items-center justify-center p-4 text-center">
             <p className="text-lg font-medium text-gray-700 transition-opacity">
             Votre carte de fidélité est prête ! Veuillez la consulter dans votre portefeuille.
             </p>
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