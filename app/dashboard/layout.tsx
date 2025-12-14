"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import {
  BarChart3,
  Search,
  FileText,
  ClipboardList,
  UserCircle,
  Sparkles,
  LogOut,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Applications", href: "/dashboard/applications", icon: ClipboardList },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Glass Sidebar */}
      <aside className="w-64 fixed h-full z-10 hidden md:block">
        <div className="h-full glass border-r-0 rounded-r-3xl m-4 my-8 flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Job Optimizer
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/10 shadow-sm"
                      : "text-muted-foreground hover:bg-white/40 hover:text-foreground hover:px-5"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 mt-auto mb-4">
            <div className="glass-card !p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 p-0.5">
                <div className="h-full w-full rounded-full bg-white/90 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  Ange Y.
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Free Plan
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="container mx-auto p-8 pt-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
