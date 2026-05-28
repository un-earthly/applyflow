"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CreditCard, TrendingUp, Users } from "lucide-react";

interface SubscriptionRecord {
  id: string;
  fullName?: string;
  email?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  createdAt?: { seconds: number };
}

export default function AdminSubscriptionsPage(): React.ReactElement {
  const [subs, setSubs] = useState<SubscriptionRecord[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "profiles"),
      where("subscriptionTier", "==", "pro"),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    getDocs(q).then((snap) => {
      setSubs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SubscriptionRecord, "id">) })));
    });
  }, []);

  const filtered = (subs ?? []).filter((s) =>
    [s.fullName, s.email].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
  );

  const mrr = (subs?.length ?? 0) * 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">Active Pro subscribers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pro subscribers", value: subs?.length ?? "—", icon: Users },
          { label: "MRR (est.)", value: subs ? `$${mrr}` : "—", icon: TrendingUp },
          { label: "ARR (est.)", value: subs ? `$${mrr * 12}` : "—", icon: CreditCard },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-muted-foreground text-sm font-medium">{card.label}</CardTitle>
                <card.icon className="text-muted-foreground h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {subs === null ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search subscribers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Since</th>
            </tr>
          </thead>
          <tbody>
            {subs === null ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={4} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{sub.fullName ?? "—"}</td>
                  <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">{sub.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge>{sub.subscriptionStatus ?? "active"}</Badge>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 text-xs md:table-cell">
                    {sub.createdAt
                      ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
