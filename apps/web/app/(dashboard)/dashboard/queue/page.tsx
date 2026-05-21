"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink, Check, X, AlertTriangle } from "lucide-react";

interface QueueItem {
  id: string;
  jobUrl: string;
  company: string;
  role: string;
  fieldsNeedingReview: number;
  createdAt: { seconds: number } | null;
  status: "pending" | "submitted" | "discarded";
}

export default function QueuePage(): React.ReactElement {
  const { user } = useAuth();
  const [items, setItems] = useState<QueueItem[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "reviewQueue"),
      where("userId", "==", user.uid),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QueueItem, "id">) })));
    });
  }, [user]);

  const handleSubmit = async (id: string) => {
    await updateDoc(doc(db, "reviewQueue", id), { status: "submitted", updatedAt: serverTimestamp() });
  };

  const handleDiscard = async (id: string) => {
    await updateDoc(doc(db, "reviewQueue", id), { status: "discarded", updatedAt: serverTimestamp() });
  };

  if (items === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <p className="text-muted-foreground text-sm">
          Applications the extension flagged for your review before submitting.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <Clock className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="font-medium">Queue is empty</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Low-confidence autofills will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{item.company}</CardTitle>
                    <p className="text-muted-foreground text-sm">{item.role}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    {item.fieldsNeedingReview} field{item.fieldsNeedingReview !== 1 ? "s" : ""} to review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.jobUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.jobUrl, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open job
                      </Button>
                    )}
                    {item.createdAt && (
                      <span className="text-muted-foreground text-xs">
                        {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDiscard(item.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Discard
                    </Button>
                    <Button size="sm" onClick={() => void handleSubmit(item.id)}>
                      <Check className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
