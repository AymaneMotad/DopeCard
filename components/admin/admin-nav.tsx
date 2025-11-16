"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  CreditCard, 
  ScanLine, 
  Users, 
  UserPlus,
  LogOut 
} from "lucide-react";

const navItems = [
  { href: "/homeDashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/scanner", label: "Scanner", icon: ScanLine },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/createUsers", label: "Create Users", icon: UserPlus },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              DopeCard Admin
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                              (item.href !== "/homeDashboard" && pathname.startsWith(item.href));
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            <div className="ml-4 pl-4 border-l border-gray-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

