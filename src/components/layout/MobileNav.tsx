"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  CalendarCheck,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: PenLine },
  { href: "/review", label: "Review", icon: CalendarCheck },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface MobileNavProps {
  reviewNudge?: boolean;
}

export function MobileNav({ reviewNudge }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-falcon-100 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors relative",
                isActive ? "text-falcon-600" : "text-falcon-500"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.href === "/review" && reviewNudge && (
                <span className="absolute right-1 top-0.5 w-2 h-2 rounded-full bg-falcon-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
