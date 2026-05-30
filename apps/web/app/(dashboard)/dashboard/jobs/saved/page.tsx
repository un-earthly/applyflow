"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { Bookmark, ExternalLink } from "lucide-react";

interface SavedJob {
  id: string;
  company: string;
  role: string;
  location?: string;
  url?: string;
  savedAt: { seconds: number };
}

export default function SavedJobsPage(): React.ReactElement {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<SavedJob[] | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "users", user.uid, "savedJobs"), orderBy("savedAt", "desc")),
      (snap) => setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavedJob[])
    );
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved Jobs</h1>
        <p className="text-muted-foreground text-sm">Jobs you bookmarked from the extension or web.</p>
      </div>

      {jobs === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8 text-muted-foreground" />}
          title="No saved jobs yet"
          description="Use the extension to bookmark jobs while browsing, or save them from job detail pages."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div>
                  <p className="font-medium text-sm">{job.role}</p>
                  <p className="text-muted-foreground text-xs">{job.company}</p>
                  {job.location && <p className="text-muted-foreground text-xs">{job.location}</p>}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground text-xs">
                    {new Date(job.savedAt.seconds * 1000).toLocaleDateString()}
                  </span>
                  {job.url && (
                    <Button variant="ghost" size="sm" render={<a href={job.url} target="_blank" rel="noopener noreferrer" />}>
                      Apply <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
