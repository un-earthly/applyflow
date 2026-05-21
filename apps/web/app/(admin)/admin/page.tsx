"use client";

import { useState, useEffect } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  users: number;
  applications: number;
  resumes: number;
}

export default function AdminPage(): React.ReactElement {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    Promise.all([
      getCountFromServer(collection(db, "profiles")),
      getCountFromServer(collection(db, "applications")),
      getCountFromServer(collection(db, "resumes")),
    ]).then(([users, applications, resumes]) => {
      setStats({
        users: users.data().count,
        applications: applications.data().count,
        resumes: resumes.data().count,
      });
    });
  }, []);

  const CARDS = [
    { label: "Total users", value: stats?.users, icon: Users },
    { label: "Applications", value: stats?.applications, icon: Briefcase },
    { label: "Resumes", value: stats?.resumes, icon: FileText },
    { label: "Active today", value: "—", icon: Activity },
  ];

  return (
    <div className="space-y-6">
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
                <card.icon className="text-muted-foreground h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {stats === null && card.value === undefined ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{card.value ?? "—"}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
