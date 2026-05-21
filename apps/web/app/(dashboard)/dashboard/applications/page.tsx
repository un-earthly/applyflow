"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string;
  source: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  salaryRange?: string;
  location?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-100" },
  screening: { label: "Screening", color: "text-purple-600", bg: "bg-purple-100" },
  interview: { label: "Interview", color: "text-amber-600", bg: "bg-amber-100" },
  offer: { label: "Offer", color: "text-green-600", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-100" },
  ghosted: { label: "Ghosted", color: "text-gray-500", bg: "bg-gray-100" },
};

const KANBAN_COLS: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
];

function StatusBadge({ status }: { status: ApplicationStatus }): React.ReactElement {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.color,
      )}
    >
      {cfg.label}
    </span>
  );
}

function AppCard({
  app,
  onStatusChange,
  onClick,
}: {
  app: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onClick: () => void;
}): React.ReactElement {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{app.companyName}</p>
            <p className="text-muted-foreground truncate text-xs">{app.roleTitle}</p>
            {app.location && (
              <p className="text-muted-foreground mt-0.5 text-xs">{app.location}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="rounded p-0.5 text-muted-foreground outline-none hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {KANBAN_COLS.filter((s) => s !== app.status).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(app.id, s);
                  }}
                >
                  Move to {STATUS_CONFIG[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <StatusBadge status={app.status} />
          <span className="text-muted-foreground text-xs">
            {new Date(app.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanView({
  apps,
  onStatusChange,
  onCardClick,
}: {
  apps: Application[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onCardClick: (id: string) => void;
}): React.ReactElement {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLS.map((status) => {
        const colApps = apps.filter((a) => a.status === status);
        return (
          <div key={status} className="w-64 shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                {STATUS_CONFIG[status].label}
              </span>
              <Badge variant="secondary" className="text-xs">
                {colApps.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {colApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onStatusChange={onStatusChange}
                  onClick={() => onCardClick(app.id)}
                />
              ))}
              {colApps.length === 0 && (
                <div className="rounded-lg border border-dashed py-6 text-center">
                  <p className="text-muted-foreground text-xs">No items</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TableView({
  apps,
  onStatusChange,
  onRowClick,
}: {
  apps: Application[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onRowClick: (id: string) => void;
}): React.ReactElement {
  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Company</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Status</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Applied</th>
            <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Location</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr
              key={app.id}
              className="border-b cursor-pointer transition-colors hover:bg-muted/30 last:border-0"
              onClick={() => onRowClick(app.id)}
            >
              <td className="px-4 py-3 font-medium">{app.companyName}</td>
              <td className="text-muted-foreground px-4 py-3">{app.roleTitle}</td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <StatusBadge status={app.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-3 text-xs md:table-cell">
                {new Date(app.appliedAt).toLocaleDateString()}
              </td>
              <td className="text-muted-foreground hidden px-4 py-3 text-xs lg:table-cell">
                {app.location ?? "—"}
              </td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="rounded p-1 text-muted-foreground outline-none hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRowClick(app.id); }}>
                      View detail
                    </DropdownMenuItem>
                    {app.jobUrl && (
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); window.open(app.jobUrl, "_blank"); }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open job URL
                      </DropdownMenuItem>
                    )}
                    {KANBAN_COLS.filter((s) => s !== app.status).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={(e) => { e.stopPropagation(); onStatusChange(app.id, s); }}
                      >
                        Move to {STATUS_CONFIG[s].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {apps.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">No applications match your filters.</p>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "table">("table");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "applications"),
      where("userId", "==", user.uid),
      orderBy("appliedAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setApps(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, "id">) })),
      );
    });
  }, [user]);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    await updateDoc(doc(db, "applications", id), { status });
  };

  const filtered = (apps ?? []).filter(
    (a) =>
      a.companyName.toLowerCase().includes(search.toLowerCase()) ||
      a.roleTitle.toLowerCase().includes(search.toLowerCase()),
  );

  if (apps === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm">
            {apps.length} total application{apps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/applications/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add application
        </Button>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <Briefcase className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="font-medium">No applications yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add one manually or install the extension to auto-track.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => router.push("/dashboard/applications/new")}>
              Add manually
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search company or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex rounded-md border">
              <button
                onClick={() => setView("table")}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  view === "table" ? "bg-muted font-medium" : "text-muted-foreground",
                )}
              >
                Table
              </button>
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  view === "kanban" ? "bg-muted font-medium" : "text-muted-foreground",
                )}
              >
                Kanban
              </button>
            </div>
          </div>

          {view === "table" ? (
            <TableView
              apps={filtered}
              onStatusChange={(id, status) => void updateStatus(id, status)}
              onRowClick={(id) => router.push(`/dashboard/applications/${id}`)}
            />
          ) : (
            <KanbanView
              apps={filtered}
              onStatusChange={(id, status) => void updateStatus(id, status)}
              onCardClick={(id) => router.push(`/dashboard/applications/${id}`)}
            />
          )}
        </>
      )}
    </div>
  );
}
