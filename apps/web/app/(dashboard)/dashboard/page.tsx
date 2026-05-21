"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useApplications } from "@/hooks/use-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, ApplicationCard, EmptyState, LoadingSpinner } from "@/components/shared";
import { Briefcase, TrendingUp, MessageSquare, Zap } from "lucide-react";
import type { ApplicationStatus } from "@repo/shared";

const statusCounts: ApplicationStatus[] = ["applied", "screening", "interview", "offer", "rejected", "ghosted"];

export default function DashboardPage(): React.ReactElement {
  const { user } = useAuth();
  const { applications, loading } = useApplications();

  const thisWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekApps = applications.filter((a) => new Date(a.appliedAt) >= thisWeekStart);
  const lastWeekApps = applications.filter(
    (a) => new Date(a.appliedAt) >= lastWeekStart && new Date(a.appliedAt) < thisWeekStart
  );

  const interviewCount = applications.filter((a) => a.status === "interview" || a.status === "offer").length;
  const offerCount = applications.filter((a) => a.status === "offer").length;
  const responseCount = applications.filter((a) => a.status !== "applied" && a.status !== "ghosted").length;
  const responseRate = applications.length > 0 ? Math.round((responseCount / applications.length) * 100) : 0;

  const pipeline = statusCounts.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  const recentApplications = applications.slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">Here&apos;s your job hunt at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Applications this week"
          value={thisWeekApps.length}
          delta={lastWeekApps.length > 0 ? Math.round(((thisWeekApps.length - lastWeekApps.length) / lastWeekApps.length) * 100) : undefined}
          icon={Briefcase}
        />
        <StatCard title="Response rate" value={`${responseRate}%`} icon={TrendingUp} />
        <StatCard title="Interviews" value={interviewCount} icon={MessageSquare} />
        <StatCard title="Offers" value={offerCount} icon={Zap} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/applications" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No applications yet"
                description="Install the browser extension or add applications manually to start tracking."
                action={{ label: "Add application", onClick: () => (window.location.href = "/dashboard/applications/new") }}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={() => (window.location.href = `/dashboard/applications/${app.id}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipeline.map((p) => (
              <div key={p.status} className="flex items-center justify-between">
                <span className="text-sm capitalize">{p.status}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${applications.length > 0 ? (p.count / applications.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-6 text-right text-xs">{p.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
