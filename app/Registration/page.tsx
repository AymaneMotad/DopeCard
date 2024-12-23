"use client"


import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { trpc } from "@/server/client"
import { useState } from "react"


const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50),
  phoneNumber: z.string(), // Change to camelCase to match database
});



export default function LoginForm() {

  const createUser = trpc.users.create.useMutation()
  const [isDownloading, setIsDownloading] = useState(false);
      // 1. Define your form.
      const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          username: "",
      },
      })
  
      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof formSchema>) {
      if (isDownloading) return;
  
      console.log('values are', values)
      createUser.mutate(values, {
          onSuccess(data) {
  
          setIsDownloading(true);
          const blob = new Blob([data.passBuffer], { type: 'application/vnd.apple.pkpass' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ADSK2D-${values.username}-pass.pkpass`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          }
      }).finally(()=> setIsDownloading(false))
      console.log('pass creation')
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
              disabled={isDownloading}
              className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              {isDownloading ? "Téléchargement en cours..." : "S'inscrire"}
            </Button>
          
         
          {/* <Button variant="outline" className="w-full">
            Login with Google
          </Button> */}
        </div>
        {/* <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="underline">
            Sign up
          </Link>
        </div> */}
        </form>
        </Form>
      </CardContent>
    </Card>
  )
}
