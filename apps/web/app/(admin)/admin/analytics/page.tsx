"use client";

import { useState, useEffect } from "react";
import { collection, getCountFromServer, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Zap, DollarSign } from "lucide-react";

interface AdminAnalyticsStats {
  totalUsers: number;
  proUsers: number;
  totalApplications: number;
  newUsersThisWeek: number;
}

export default function AdminAnalyticsPage(): React.ReactElement {
  const [stats, setStats] = useState<AdminAnalyticsStats | null>(null);

  useEffect(() => {
    const weekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    Promise.all([
      getCountFromServer(collection(db, "profiles")),
      getCountFromServer(query(collection(db, "profiles"), where("subscriptionTier", "==", "pro"))),
      getCountFromServer(collection(db, "applications")),
      getCountFromServer(query(collection(db, "profiles"), where("createdAt", ">=", weekAgo))),
    ]).then(([total, pro, apps, newUsers]) => {
      setStats({
        totalUsers: total.data().count,
        proUsers: pro.data().count,
        totalApplications: apps.data().count,
        newUsersThisWeek: newUsers.data().count,
      });
    });
  }, []);

  const freeUsers = stats ? stats.totalUsers - stats.proUsers : null;
  const conversionRate = stats && stats.totalUsers > 0
    ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1)
    : null;

  const CARDS = [
    { label: "Total users", value: stats?.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Pro subscribers", value: stats?.proUsers, icon: DollarSign, color: "text-green-500" },
    { label: "Free users", value: freeUsers, icon: Users, color: "text-muted-foreground" },
    { label: "New users (7d)", value: stats?.newUsersThisWeek, icon: TrendingUp, color: "text-purple-500" },
    { label: "Total applications", value: stats?.totalApplications, icon: Zap, color: "text-amber-500" },
    { label: "Conversion rate", value: conversionRate ? `${conversionRate}%` : null, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Platform-wide metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{card.value ?? "—"}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        <TrendingUp className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm">Detailed charts and cohort analysis — connect a BI tool to Firestore for advanced reporting.</p>
      </div>
    </div>
  );
}
