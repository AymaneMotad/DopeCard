import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Define protected admin routes
    const adminRoutes = [
      "/homeDashboard",
      "/cards",
      "/scanner",
      "/customers",
      "/createUsers",
    ];
    
    const isAdminRoute = pathname.startsWith("/admin") || 
                        adminRoutes.some(route => pathname.startsWith(route));

    // Allow access to login page
    if (pathname === "/admin/login") {
      // If already logged in, redirect to dashboard
      if (token) {
        return NextResponse.redirect(new URL("/homeDashboard", req.url));
      }
      return NextResponse.next();
    }

    // Protect admin routes
    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      
      // Only admin role can access admin routes
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Allow login page without auth
        if (pathname === "/admin/login") {
          return true;
        }
        
        // Require auth for admin routes
        const adminRoutes = [
          "/homeDashboard",
          "/cards",
          "/scanner",
          "/customers",
          "/createUsers",
        ];
        
        const isAdminRoute = pathname.startsWith("/admin") || 
                            adminRoutes.some(route => pathname.startsWith(route));
        
        if (isAdminRoute) {
          return !!token && token.role === "admin";
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/homeDashboard/:path*",
    "/cards/:path*",
    "/scanner/:path*",
    "/customers/:path*",
    "/createUsers/:path*",
  ],
};