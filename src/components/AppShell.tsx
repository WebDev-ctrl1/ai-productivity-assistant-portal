import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Mail,
  Search,
  MessagesSquare,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export const DISCLAIMER =
  "AI-generated content may contain inaccuracies. Review and verify important information before using it in professional communications or making decisions. Do not enter confidential, sensitive, or personal information unless you have confirmed that your AI provider handles it appropriately.";

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [path]);
  const current = NAV.find((n) => n.to === path)?.label ?? "Workspace";

  const nav = (compact: boolean) => (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          title={compact ? label : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            path === to && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            compact && "justify-center px-0",
          )}
        >
          <Icon className="size-4 shrink-0" />
          {!compact && label}
        </Link>
      ))}
    </nav>
  );

  const brand = (compact: boolean) => (
    <div className={cn("flex h-14 items-center gap-2 border-b px-4", compact && "justify-center px-0")}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Briefcase className="size-4" />
      </span>
      {!compact && <span className="text-sm font-bold leading-tight">Workplace AI</span>}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card transition-[width] md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {brand(collapsed)}
        {nav(collapsed)}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-auto flex items-center justify-center gap-2 border-t p-3 text-xs text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /> Collapse</>}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-64 bg-card shadow-xl">
            <button className="absolute right-3 top-4 text-muted-foreground" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
            {brand(false)}
            {nav(false)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="hidden text-sm text-muted-foreground sm:inline">AI Workplace Productivity Assistant</span>
          <span className="hidden text-muted-foreground sm:inline">/</span>
          <h1 className="text-sm font-semibold">{current}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-success" /> Live AI
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground" aria-label="Your profile">
              ME
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
        <footer className="border-t px-4 py-4 text-center text-xs leading-relaxed text-muted-foreground md:px-8">
          {DISCLAIMER}
        </footer>
      </div>
    </div>
  );
}
