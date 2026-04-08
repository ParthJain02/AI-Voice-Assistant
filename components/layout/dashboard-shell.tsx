"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MessageSquare, CheckSquare, BellRing, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/reminders", label: "Reminders", icon: BellRing },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-zinc-200 bg-white/80 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 lg:block">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">VoicePilot AI</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-emerald-500 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button className="mt-6 w-full" variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} className="mr-2" />
            Sign out
          </Button>
        </aside>

        <div className="flex-1">
          <div className="mb-4 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Voice-first productivity assistant with streaming AI and reminders.</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
