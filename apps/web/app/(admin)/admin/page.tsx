"use client";

import { useState, useEffect } from "react";
import { collection, getCountFromServer, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, FileText, Activity, CreditCard, Zap } from "lucide-react";

interface AdminStats {
  users: number;
  applications: number;
  resumes: number;
  proUsers: number;
}

interface Health {
  firebase: "ok" | "error";
  stripe: "ok" | "error";
  ai: "ok" | "error";
}

interface RecentUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: { seconds: number } | null;
}

function StatusDot({ status }: { status: "ok" | "error" | undefined }): React.ReactElement {
  if (!status) return <span className="h-2 w-2 rounded-full bg-muted animate-pulse inline-block" />;
  return (
    <span
      className={`h-2 w-2 rounded-full inline-block ${status === "ok" ? "bg-green-500" : "bg-red-500"}`}
    />
  );
}

export default function AdminPage(): React.ReactElement {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[] | null>(null);

  useEffect(() => {
    Promise.all([
      getCountFromServer(collection(db, "profiles")),
      getCountFromServer(collection(db, "applications")),
      getCountFromServer(collection(db, "resumes")),
      getCountFromServer(query(collection(db, "profiles"), where("subscriptionTier", "==", "pro"))),
    ]).then(([users, applications, resumes, proUsers]) => {
      setStats({
        users: users.data().count,
        applications: applications.data().count,
        resumes: resumes.data().count,
        proUsers: proUsers.data().count,
      });
    });

    const rq = query(collection(db, "profiles"), orderBy("createdAt", "desc"), limit(5));
    getDocs(rq).then((snap) => {
      setRecentUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecentUser, "id">) })));
    });

    fetch("/api/admin/health")
      .then((r) => r.json())
      .then((data: { services: Health }) => setHealth(data.services))
      .catch(() => {});
  }, []);

  const CARDS = [
    { label: "Total users", value: stats?.users, icon: Users, color: "text-blue-500" },
    { label: "Pro subscribers", value: stats?.proUsers, icon: CreditCard, color: "text-purple-500" },
    { label: "Applications", value: stats?.applications, icon: Briefcase, color: "text-amber-500" },
    { label: "Resumes", value: stats?.resumes, icon: FileText, color: "text-green-500" },
  ];

  const HEALTH_SERVICES = [
    { key: "firebase" as const, label: "Firebase" },
    { key: "stripe" as const, label: "Stripe" },
    { key: "ai" as const, label: "AI provider" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin overview</h1>
        <p className="text-muted-foreground text-sm">Platform health at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-muted-foreground text-sm font-medium">{card.label}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stats === null ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{card.value ?? "—"}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System health */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">System health</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {HEALTH_SERVICES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-2">
                  <StatusDot status={health?.[key]} />
                  <Badge
                    variant={health?.[key] === "ok" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {health ? (health[key] === "ok" ? "Healthy" : "Error") : "Checking…"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent signups */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Recent signups</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers === null ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {u.displayName?.[0]?.toUpperCase() ?? u.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.displayName ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    {u.createdAt && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(u.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LLM spend placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">LLM usage today</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Usage tracking will appear here once AI calls are instrumented with cost logging.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
