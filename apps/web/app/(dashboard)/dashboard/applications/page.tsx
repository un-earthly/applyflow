"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, LayoutGrid, List } from "lucide-react";

type ApplicationStatus = "applied" | "screening" | "interview" | "offer" | "rejected" | "ghosted";

interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: { seconds: number };
  url?: string;
}

const STATUS_COLUMNS: ApplicationStatus[] = ["applied", "screening", "interview", "offer", "rejected", "ghosted"];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-800",
  screening: "bg-purple-100 text-purple-800",
  interview: "bg-amber-100 text-amber-800",
  offer: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  ghosted: "bg-gray-100 text-gray-600",
};

function groupByStatus(apps: Application[]): Record<string, Application[]> {
  const groups: Record<string, Application[]> = {};
  for (const app of apps) {
    if (!groups[app.status]) groups[app.status] = [];
    groups[app.status]!.push(app);
  }
  return groups;
}

export default function ApplicationsPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", user.uid, "applications"),
        orderBy("appliedAt", "desc")
      ),
      (snap) => {
        setApplications(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Application[]
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredApplications =
    applications === null
      ? null
      : filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const grouped = filteredApplications ? groupByStatus(filteredApplications) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm">Track and manage your job applications</p>
        </div>
        <Button onClick={() => router.push("/dashboard/applications/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="ghosted">Ghosted</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "kanban" | "table")}>
          <TabsList>
            <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="table"><List className="h-4 w-4" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {applications === null ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {STATUS_COLUMNS.map((s) => <Skeleton key={s} className="h-64" />)}
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STATUS_COLUMNS.map((status) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold capitalize">{status}</h3>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {grouped?.[status]?.length ?? 0}
                </span>
              </div>
              {grouped?.[status]?.map((app) => (
                <Card
                  key={app.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm font-medium leading-tight">{app.role}</p>
                    <p className="text-muted-foreground text-xs">{app.company}</p>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {new Date(app.appliedAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredApplications?.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium">{app.company}</td>
                  <td className="px-4 py-3 text-sm">{app.role}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(app.appliedAt.seconds * 1000).toLocaleDateString()}
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
