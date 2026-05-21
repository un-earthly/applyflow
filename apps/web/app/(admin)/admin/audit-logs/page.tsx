"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface AuditLog {
  id: string;
  actor?: string;
  action: string;
  target?: string;
  ip?: string;
  createdAt?: { seconds: number };
}

export default function AdminAuditLogsPage(): React.ReactElement {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(200));
    getDocs(q).then((snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLog, "id">) })));
    });
  }, []);

  const filtered = (logs ?? []).filter((l) =>
    [l.actor, l.action, l.target].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit logs</h1>
        <p className="text-muted-foreground text-sm">System-wide activity log.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium">Actor</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Target</th>
              <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">IP</th>
              <th className="px-4 py-3 text-left font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs === null ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No logs found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {log.actor?.substring(0, 12) ?? "system"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-mono text-xs">{log.action}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {log.target ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">
                    {log.ip ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {log.createdAt
                      ? new Date(log.createdAt.seconds * 1000).toLocaleString()
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
