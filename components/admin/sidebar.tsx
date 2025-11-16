"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  CreditCard, 
  ScanLine, 
  Users, 
  UserPlus,
  LogOut,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/homeDashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/scanner", label: "Scanner", icon: ScanLine },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/createUsers", label: "Create Users", icon: UserPlus },
  { href: "/admin/test-card", label: "Test Card", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/homeDashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl",
          "flex flex-col relative",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 ease-in-out"
        )}
      >
        {/* Subtle Color Overlay - 20% gradient colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/10 pointer-events-none z-0" />
        
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 relative z-10">
          <Link href="/homeDashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-colors border border-white/10"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                DopeCard
              </h1>
              <p className="text-xs text-white/60 font-medium">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href} onClick={() => setIsMobileOpen(false)}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      active
                        ? "bg-white/10 backdrop-blur-sm shadow-lg border border-white/10"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-white/5 text-white/70 group-hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-sm tracking-wide",
                        active ? "text-white" : "text-white/70"
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 rounded-full bg-white"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/10 relative z-10">
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-white/70 hover:text-white transition-colors border border-transparent hover:border-red-500/20"
            >
              <div className="p-2 rounded-lg bg-red-500/10">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">Logout</span>
            </Button>
          </motion.div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
}

