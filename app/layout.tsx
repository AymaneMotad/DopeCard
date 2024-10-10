import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "@/components/ui/trpc-provider";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Card } from "@/components/ui/card"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DopeCard",
  description: "Your Premium Digital Card Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-white`}
        >
          <div className="min-h-screen flex flex-col">
            {/* Decorative header gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
            
            <nav className="sticky top-0 backdrop-blur-lg bg-white/80 border-b border-gray-100 z-50">
              <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    DopeCard
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium">
                    Premium
                  </span>
                </div>
                
                <Card className="p-1 bg-white shadow-sm border border-gray-100">
                  <SignedOut>
                    <SignInButton>
                      <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="p-1 rounded-lg hover:bg-gray-50 transition-colors">
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8"
                          }
                        }}
                      />
                    </div>
                  </SignedIn>
                </Card>
              </div>
            </nav>
            
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
              <Card className="p-8 border border-gray-100 shadow-sm bg-gradient-to-b from-white to-gray-50/50">
                <TRPCProvider>
                  {children}
                </TRPCProvider>
              </Card>
            </main>

            <footer className="border-t border-gray-100 bg-gray-50/50">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    © 2024 DopeCard. Premium Digital Card Solutions.
                  </span>
                  <div className="flex space-x-6">
                    <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Privacy</span>
                    <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Terms</span>
                    <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Contact</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}