"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Textarea,
} from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

interface Application {
  id: string;
  company: string;
  role: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "ghosted";
  url?: string;
  notes?: string;
  appliedAt: { seconds: number };
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user || !params.id) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "applications", params.id as string),
      (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Application;
          setApplication(data);
          setNotes(data.notes || "");
          setStatus(data.status);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, params.id]);

  const handleSave = async () => {
    if (!user || !params.id || !application) return;
    setSaving(true);
    try {
      await updateDoc(
        doc(db, "users", user.uid, "applications", params.id as string),
        {
          notes,
          status,
          updatedAt: serverTimestamp(),
        }
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{application.role}</h1>
          <p className="text-muted-foreground">{application.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="ghosted">Ghosted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Add notes about this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Interview feedback, follow-up reminders, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Applied</p>
                <p className="font-medium">
                  {new Date(application.appliedAt.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
              {application.url && (
                <div>
                  <p className="text-muted-foreground mb-2">Job Posting</p>
                  <Button variant="outline" size="sm" className="w-full" render={<a href={application.url} target="_blank" rel="noopener noreferrer" />}>
                    View <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              )}
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
