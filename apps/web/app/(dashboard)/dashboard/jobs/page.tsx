"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkCheck, ExternalLink, Trash2, Sparkles } from "lucide-react";

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  savedAt: { seconds: number } | null;
  matchScore?: number;
}

export default function JobsPage(): React.ReactElement {
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedJob[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "savedJobs"),
      where("userId", "==", user.uid),
      orderBy("savedAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setSaved(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedJob, "id">) })));
    });
  }, [user]);

  const handleUnsave = async (id: string) => {
    await deleteDoc(doc(db, "savedJobs", id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="text-muted-foreground text-sm">Saved and recommended job postings.</p>
      </div>

      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-4">
          {saved === null ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
              <BookmarkCheck className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="font-medium">No saved jobs yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Use the extension to save jobs while browsing job boards.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {saved.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{job.title}</CardTitle>
                        <p className="text-muted-foreground text-sm">{job.company} · {job.location}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {job.matchScore !== undefined && (
                          <Badge variant="secondary">{job.matchScore}% match</Badge>
                        )}
                        <Badge variant="outline" className="capitalize">{job.source}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {job.url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(job.url, "_blank")}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View job
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleUnsave(job.id)}
                        className="text-muted-foreground"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                      {job.savedAt && (
                        <span className="text-muted-foreground ml-auto text-xs">
                          Saved {new Date(job.savedAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <Sparkles className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="font-medium">AI recommendations coming soon</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Complete your profile and preferences to get personalized job matches.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
