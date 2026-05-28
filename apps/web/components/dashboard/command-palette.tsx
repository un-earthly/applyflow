"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  FileText,
  Mail,
  BookmarkCheck,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Search,
} from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
  keywords?: string;
}

export function CommandPalette(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { signOut } = useAuth();

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const ALL_COMMANDS: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Navigate", action: () => go("/dashboard") },
    { id: "applications", label: "Applications", icon: Briefcase, group: "Navigate", action: () => go("/dashboard/applications") },
    { id: "queue", label: "Queue", icon: Clock, group: "Navigate", action: () => go("/dashboard/queue") },
    { id: "resumes", label: "Resumes", icon: FileText, group: "Navigate", action: () => go("/dashboard/resume") },
    { id: "cover-letters", label: "Cover Letters", icon: Mail, group: "Navigate", action: () => go("/dashboard/cover-letters") },
    { id: "jobs", label: "Saved Jobs", icon: BookmarkCheck, group: "Navigate", action: () => go("/dashboard/jobs") },
    { id: "analytics", label: "Analytics", icon: BarChart3, group: "Navigate", action: () => go("/dashboard/analytics") },
    { id: "settings", label: "Settings", icon: Settings, group: "Navigate", action: () => go("/dashboard/settings/profile") },
    { id: "new-resume", label: "New Resume", icon: Plus, group: "Actions", action: () => go("/dashboard/resume?new=1"), keywords: "create upload" },
    { id: "new-application", label: "Log Application", icon: Plus, group: "Actions", action: () => go("/dashboard/applications/new"), keywords: "add create log" },
    { id: "billing", label: "Billing & Plans", icon: Settings, group: "Actions", action: () => go("/dashboard/settings/billing"), keywords: "upgrade pro subscription" },
    { id: "sign-out", label: "Sign out", icon: LogOut, group: "Account", action: () => { void signOut(); setOpen(false); } },
  ];

  const filtered = query.trim()
    ? ALL_COMMANDS.filter((cmd) =>
        `${cmd.label} ${cmd.description ?? ""} ${cmd.keywords ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      )
    : ALL_COMMANDS;

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    (acc[cmd.group] ??= []).push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) { setQuery(""); setActiveIndex(0); }
    else setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatFiltered[activeIndex]) {
      flatFiltered[activeIndex].action();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let cursor = -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl bg-popover ring-1 ring-foreground/10 shadow-2xl overflow-hidden outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, actions…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">esc</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {flatFiltered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No results for "{query}"</p>
            )}
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group}
                </p>
                {items.map((item) => {
                  cursor++;
                  const idx = cursor;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors",
                        activeIndex === idx ? "bg-muted text-foreground" : "text-foreground/70 hover:bg-muted/50",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="ml-auto text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="border-t px-4 py-2.5 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="border rounded px-1">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="border rounded px-1">↵</kbd> select</span>
            <span className="flex items-center gap-1"><kbd className="border rounded px-1">⌘K</kbd> toggle</span>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
