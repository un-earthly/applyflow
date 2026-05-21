"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Lock } from "lucide-react";

type AppStatus = "applied" | "screening" | "interview" | "offer" | "rejected" | "ghosted";

interface Stats {
  total: number;
  byStatus: Record<AppStatus, number>;
  responseRate: number;
  interviewRate: number;
}

const STATUS_LABELS: Record<AppStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

const STATUS_COLORS: Record<AppStatus, string> = {
  applied: "bg-blue-500",
  screening: "bg-purple-500",
  interview: "bg-amber-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
  ghosted: "bg-gray-400",
};

export default function AnalyticsPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      if (snap.exists()) {
        const tier = snap.data().subscriptionTier ?? "free";
        setIsPro(tier !== "free");
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "applications"), where("userId", "==", user.uid));
    getDocs(q).then((snap) => {
      const apps = snap.docs.map((d) => d.data() as { status: AppStatus });
      const byStatus = {
        applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0, ghosted: 0,
      };
      apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1; });
      const total = apps.length;
      const responded = byStatus.screening + byStatus.interview + byStatus.offer + byStatus.rejected;
      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
      const interviewRate = total > 0 ? Math.round(((byStatus.interview + byStatus.offer) / total) * 100) : 0;
      setStats({ total, byStatus, responseRate, interviewRate });
    });
  }, [user]);

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Insights about your job search.</p>
        </div>

        {/* Blurred preview */}
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {["Applications", "Response rate", "Interview rate", "Offers"].map((label) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">—</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="mx-4 max-w-sm text-center shadow-lg">
              <CardContent className="pt-6 pb-6">
                <Lock className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                <p className="font-semibold">Analytics is a Pro feature</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Upgrade to track response rates, interview conversion, and more.
                </p>
                <Button className="mt-4 w-full" onClick={() => router.push("/dashboard/settings/billing")}>
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Your job search performance.</p>
        </div>
        <Badge variant="secondary"><TrendingUp className="mr-1 h-3 w-3" />Pro</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Response rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats ? `${stats.responseRate}%` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Interview rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats ? `${stats.interviewRate}%` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.byStatus.offer ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Object.entries(stats.byStatus) as [AppStatus, number][]).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-20 text-sm">{STATUS_LABELS[status]}</span>
                  <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[status]}`}
                      style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-right text-sm">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
