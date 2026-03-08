"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  CalendarCheck,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: PenLine },
  { href: "/review", label: "Review", icon: CalendarCheck },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  seasonLabel?: string | null;
  seasonDays?: number | null;
  reviewNudge?: boolean;
}

export function Sidebar({ seasonLabel, seasonDays, reviewNudge }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-falcon-100 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 py-6">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-medium text-falcon-950 tracking-tight">
            Aligned
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-falcon-100 text-falcon-500 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative",
                isActive
                  ? "bg-falcon-600 text-falcon-50"
                  : "text-falcon-800 hover:bg-falcon-100"
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
              {item.href === "/review" && reviewNudge && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-falcon-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {seasonLabel && !collapsed && (
        <div className="px-4 py-4 border-t border-falcon-100">
          <p className="text-xs text-falcon-500">Current season</p>
          <p className="text-sm text-falcon-800 font-medium truncate">{seasonLabel}</p>
          {seasonDays !== null && seasonDays !== undefined && (
            <p className="text-xs text-falcon-500">{seasonDays} days in</p>
          )}
        </div>
      )}
    </aside>
  );
}
