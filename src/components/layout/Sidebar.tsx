"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "My Tasks", href: "/tasks", icon: "📝" },
  { name: "Today", href: "/tasks?filter=TODAY", icon: "📅" },
  { name: "Upcoming", href: "/tasks?filter=UPCOMING", icon: "⏳" },
  { name: "Completed", href: "/tasks?filter=COMPLETED", icon: "✅" },
  { name: "Calendar", href: "/calendar", icon: "🗓️" },
  { name: "Progress", href: "/progress", icon: "📈" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800 max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:z-30 max-md:w-full max-md:min-h-0 max-md:flex-row max-md:border-r-0 max-md:border-t">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 max-md:hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
          ⏰
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">
            RemindFlow
          </h1>
          <p className="text-xs text-slate-400">Task & Alarm Manager</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-md:flex max-md:space-y-0 max-md:gap-1 max-md:p-2 max-md:overflow-x-auto max-md:overflow-y-hidden">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider max-md:hidden">
          Menu
        </div>
        {navItems.map((item) => {
          const isExact = pathname === item.href;
          const isTasksRoot =
            item.href === "/tasks" && pathname === "/tasks";
          const isActive = isExact || isTasksRoot;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors max-md:flex-col max-md:gap-0.5 max-md:px-3 max-md:py-1.5 max-md:text-[10px] max-md:shrink-0 max-md:whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 max-md:hidden">
        <div className="flex items-center justify-between">
          <span>Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
