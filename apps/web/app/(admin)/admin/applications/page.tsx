"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, getCountFromServer, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Briefcase } from "lucide-react";

interface ApplicationRecord {
  id: string;
  companyName?: string;
  roleTitle?: string;
  status?: string;
  userId?: string;
  appliedAt?: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  applied: "secondary",
  screening: "default",
  interview: "default",
  offer: "default",
  rejected: "destructive",
  ghosted: "outline",
};

export default function AdminApplicationsPage(): React.ReactElement {
  const [apps, setApps] = useState<ApplicationRecord[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("appliedAt", "desc"), limit(100));
    getDocs(q).then((snap) => {
      setApps(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ApplicationRecord, "id">) })));
    });
    getCountFromServer(collection(db, "applications")).then((snap) => {
      setTotalCount(snap.data().count);
    });
  }, []);

  const filtered = (apps ?? []).filter((a) =>
    [a.companyName, a.roleTitle, a.userId].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="text-muted-foreground text-sm">All application records across users.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total applications</CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          {totalCount === null ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{totalCount}</p>}
        </CardContent>
      </Card>

      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search applications…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium">Company</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">User ID</th>
              <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Applied</th>
            </tr>
          </thead>
          <tbody>
            {apps === null ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.map((app) => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{app.companyName ?? "—"}</td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{app.roleTitle ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[app.status ?? ""] ?? "outline"} className="capitalize">
                    {app.status ?? "—"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                  {app.userId?.substring(0, 12) ?? "—"}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground text-xs lg:table-cell">
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
