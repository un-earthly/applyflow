"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, TrendingUp, Calendar, Zap, ArrowRight, Plus } from "lucide-react";

type AppStatus = "applied" | "screening" | "interview" | "offer" | "rejected" | "ghosted";

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  status: AppStatus;
  appliedAt: string;
}

const STATUS_COLORS: Record<AppStatus, string> = {
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-purple-100 text-purple-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  ghosted: "bg-gray-100 text-gray-600",
};

interface Stats {
  total: number;
  active: number;
  interviews: number;
  offers: number;
}

export default function DashboardPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Application[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "applications"), where("userId", "==", user.uid));
    getDocs(q).then((snap) => {
      const apps = snap.docs.map((d) => d.data() as { status: AppStatus });
      setStats({
        total: apps.length,
        active: apps.filter((a) => ["applied", "screening", "interview"].includes(a.status)).length,
        interviews: apps.filter((a) => a.status === "interview").length,
        offers: apps.filter((a) => a.status === "offer").length,
      });
    });

    const rq = query(
      collection(db, "applications"),
      where("userId", "==", user.uid),
      orderBy("appliedAt", "desc"),
      limit(5),
    );
    getDocs(rq).then((snap) => {
      setRecent(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, "id">) })));
    });
  }, [user]);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const STAT_CARDS = [
    { label: "Total applications", value: stats?.total ?? "—", icon: Briefcase, color: "text-blue-500" },
    { label: "Active", value: stats?.active ?? "—", icon: TrendingUp, color: "text-purple-500" },
    { label: "Interviews", value: stats?.interviews ?? "—", icon: Calendar, color: "text-amber-500" },
    { label: "Autofills left", value: "10", icon: Zap, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground text-sm">Here&apos;s your job hunt at a glance.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/applications/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add application
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {card.label}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats === null ? <Skeleton className="h-8 w-12" /> : card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent applications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/applications")}
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recent === null ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">No applications yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push("/dashboard/applications/new")}
                >
                  Add your first
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((app) => (
                  <div
                    key={app.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{app.companyName}</p>
                      <p className="text-muted-foreground truncate text-xs">{app.roleTitle}</p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Add a new application", href: "/dashboard/applications/new", icon: Plus },
              { label: "Create a resume", href: "/dashboard/resume", icon: Briefcase },
              { label: "Write a cover letter", href: "/dashboard/cover-letters", icon: Briefcase },
              { label: "Browse saved jobs", href: "/dashboard/jobs", icon: Briefcase },
            ].map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <action.icon className="text-muted-foreground h-4 w-4" />
                {action.label}
                <ArrowRight className="text-muted-foreground ml-auto h-4 w-4" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
