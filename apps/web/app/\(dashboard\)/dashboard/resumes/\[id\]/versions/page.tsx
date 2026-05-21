"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, RotateCcw, Trash2 } from "lucide-react";

interface Version {
  id: string;
  createdAt: { seconds: number };
  createdBy: string;
  action: string;
  changes?: string;
}

export default function VersionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !params.id) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", user.uid, "resumes", params.id as string, "versions"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const versionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Version[];
        setVersions(versionsList);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Skeleton className="h-8 w-40 mb-6" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mb-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Version History</h1>
          <p className="text-muted-foreground">{versions.length} versions saved</p>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No versions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, idx) => (
            <div key={version.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {idx === 0 ? "Current version" : `Version ${versions.length - idx}`}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.createdAt.seconds * 1000).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{version.action}</p>
                </div>
                <div className="flex items-center gap-2">
                  {idx !== 0 && (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
