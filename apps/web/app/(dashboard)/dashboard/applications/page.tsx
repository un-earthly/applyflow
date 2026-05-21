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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, LayoutGrid, List } from "lucide-react";

interface Application {
  id: string;
  company: string;
  role: string;
  status: "applied" | "interviewing" | "offered" | "rejected" | "accepted";
  appliedAt: { seconds: number };
  url?: string;
}

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-purple-100 text-purple-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-green-700 text-white",
};

export default function ApplicationsPage() {
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
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Application[]
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

  const groupedByStatus = filteredApplications
    ? Object.groupBy(filteredApplications, (app) => app.status)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage your job applications
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/applications/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="kanban" size="sm">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table" size="sm">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {applications === null ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {["applied", "interviewing", "offered", "accepted", "rejected"].map(
            (status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold capitalize">{status}</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {groupedByStatus?.[status as keyof typeof groupedByStatus]?.length || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedByStatus?.[status as keyof typeof groupedByStatus]?.map((app) => (
                    <Card
                      key={app.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                    >
                      <CardContent className="pt-4">
                        <p className="font-medium text-sm">{app.role}</p>
                        <p className="text-xs text-muted-foreground">{app.company}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(app.appliedAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[app.status]}`}>
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
