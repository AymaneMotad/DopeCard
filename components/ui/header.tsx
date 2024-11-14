import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Card } from "@/components/ui/card"
import { Sign } from "crypto";

export default function Header() {
  return (
    
     <nav className="sticky top-0 backdrop-blur-lg bg-white/80 border-b border-gray-100 z-50">
             {/* Header */}
      <header className="sticky top-0 backdrop-blur-lg bg-white/80 border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              DopeCard
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium">
              Premium
            </span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Fonctionnalités</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">Comment ça marche</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </nav>
          <button className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity">
            Commencer
          </button>
          <SignInButton/>
          <SignedIn/>
          <SignedOut/>
          <UserButton/>
         </div>
      </header>
            </nav>
    
  );
}