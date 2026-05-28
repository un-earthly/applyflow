"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, LayoutGrid, List } from "lucide-react";
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
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: { seconds: number } | string;
  url?: string;
  location?: string;
  source?: string;
}

const STATUS_COLUMNS: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
];

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  screening: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  interview: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  offer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  ghosted: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function daysAgo(appliedAt: Application["appliedAt"]): string {
  const ts =
    typeof appliedAt === "string"
      ? new Date(appliedAt).getTime()
      : appliedAt.seconds * 1000;
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function getFavicon(url?: string): string | null {
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function AppCard({
  app,
  isDragging,
}: {
  app: Application;
  isDragging?: boolean;
}) {
  const router = useRouter();
  const favicon = getFavicon(app.url);

  return (
    <div
      onClick={() => router.push(`/dashboard/applications/${app.id}`)}
      className={cn(
        "cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start gap-2">
        {favicon ? (
          <img src={favicon} alt="" className="mt-0.5 h-4 w-4 shrink-0 rounded-sm" />
        ) : (
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-sm bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{app.role}</p>
          <p className="truncate text-xs text-muted-foreground">{app.company}</p>
          {app.location && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{app.location}</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {app.source && (
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {app.source}
          </Badge>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {daysAgo(app.appliedAt)}
        </span>
      </div>
    </div>
  );
}

function DraggableCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: app.id,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <AppCard app={app} isDragging={isDragging} />
    </div>
  );
}

function KanbanColumn({
  status,
  apps,
}: {
  status: ApplicationStatus;
  apps: Application[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-32 flex-col gap-2 rounded-lg border p-2 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-xs font-semibold capitalize">{status}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {apps.length}
        </span>
      </div>
      {apps.map((app) => (
        <DraggableCard key={app.id} app={app} />
      ))}
    </div>
  );
}

export default function ApplicationsPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(
        collection(db, "users", user.uid, "applications"),
        orderBy("appliedAt", "desc"),
      ),
      (snap) => {
        setApplications(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, "id">) })),
        );
      },
    );
  }, [user]);

  const filtered =
    applications === null
      ? null
      : filterStatus === "all"
        ? applications
        : applications.filter((a) => a.status === filterStatus);

  const grouped = STATUS_COLUMNS.reduce<Record<string, Application[]>>(
    (acc, s) => {
      acc[s] = filtered?.filter((a) => a.status === s) ?? [];
      return acc;
    },
    {},
  );

  const handleDragStart = (e: DragStartEvent) => {
    const app = applications?.find((a) => a.id === e.active.id);
    setActiveApp(app ?? null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = e;
    if (!over || !user) return;
    const newStatus = over.id as ApplicationStatus;
    const app = applications?.find((a) => a.id === active.id);
    if (!app || app.status === newStatus) return;

    await updateDoc(
      doc(db, "users", user.uid, "applications", app.id),
      { status: newStatus },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm">
            {applications !== null ? `${applications.length} total` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/applications/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New application
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_COLUMNS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "kanban" | "table")}
          className="ml-auto"
        >
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {applications === null ? (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STATUS_COLUMNS.map((s) => (
            <Skeleton key={s} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <p className="font-medium">No applications yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add your first application to get started.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/applications/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add application
          </Button>
        </div>
      ) : viewMode === "kanban" ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {STATUS_COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                apps={grouped[status] ?? []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeApp ? <AppCard app={activeApp} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered?.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                >
                  <td className="px-4 py-3 font-medium">{app.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLE[app.status],
                      )}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {daysAgo(app.appliedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
