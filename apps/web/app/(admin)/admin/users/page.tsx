"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface UserProfile {
  id: string;
  fullName?: string;
  email?: string;
  subscriptionTier?: string;
  createdAt?: { seconds: number };
  onboardingCompleted?: boolean;
}

export default function AdminUsersPage(): React.ReactElement {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"), limit(100));
    getDocs(q).then((snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserProfile, "id">) })));
    });
  }, []);

  const filtered = (users ?? []).filter((u) =>
    [u.fullName, u.email].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground text-sm">All registered accounts.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search users…"
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
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users === null ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.fullName ?? "—"}</td>
                  <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.subscriptionTier === "pro" ? "default" : "secondary"}>
                      {user.subscriptionTier ?? "free"}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 text-xs md:table-cell">
                    {user.createdAt
                      ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      View
                    </Button>
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
