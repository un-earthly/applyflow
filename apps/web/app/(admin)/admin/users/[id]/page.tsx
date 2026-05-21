"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Calendar, Shield, Briefcase, FileText } from "lucide-react";

interface UserProfile {
  id: string;
  fullName?: string;
  email?: string;
  subscriptionTier?: string;
  createdAt?: { seconds: number };
  onboardingCompleted?: boolean;
  jobTitle?: string;
  location?: string;
  bio?: string;
  photoURL?: string;
}

interface AppStats {
  total: number;
  resumes: number;
  coverLetters: number;
}

export default function AdminUserDetailPage(): React.ReactElement {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "profiles", id)).then((snap) => {
      if (!snap.exists()) {
        setUser(null);
        return;
      }
      setUser({ id: snap.id, ...(snap.data() as Omit<UserProfile, "id">) });
    });

    Promise.all([
      getDocs(query(collection(db, "applications"), where("userId", "==", id))),
      getDocs(query(collection(db, "resumes"), where("userId", "==", id))),
      getDocs(query(collection(db, "coverLetters"), where("userId", "==", id))),
    ]).then(([apps, resumes, cls]) => {
      setStats({ total: apps.size, resumes: resumes.size, coverLetters: cls.size });
    });
  }, [id]);

  if (user === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{user.fullName ?? "Unknown user"}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Full name</p>
                  <p className="font-medium">{user.fullName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Job title</p>
                  <p className="font-medium">{user.jobTitle ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{user.location ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Bio</p>
                  <p className="font-medium">{user.bio ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {stats === null ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-muted-foreground text-xs mt-1">Applications</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{stats.resumes}</p>
                    <p className="text-muted-foreground text-xs mt-1">Resumes</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{stats.coverLetters}</p>
                    <p className="text-muted-foreground text-xs mt-1">Cover letters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge variant={user.subscriptionTier === "pro" ? "default" : "secondary"}>
                  {user.subscriptionTier ?? "free"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Onboarding</span>
                <Badge variant={user.onboardingCompleted ? "default" : "outline"}>
                  {user.onboardingCompleted ? "Complete" : "Pending"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {user.createdAt
                    ? `Joined ${new Date(user.createdAt.seconds * 1000).toLocaleDateString()}`
                    : "Join date unknown"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                <Mail className="mr-2 h-4 w-4" />
                Send email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                <Shield className="mr-2 h-4 w-4" />
                Impersonate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
