"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
<<<<<<< HEAD
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
=======
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
<<<<<<< HEAD
  ArrowLeft,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string;
  source: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string;
  salaryRange?: string;
  location?: string;
  userId: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-100" },
  screening: { label: "Screening", color: "text-purple-600", bg: "bg-purple-100" },
  interview: { label: "Interview", color: "text-amber-600", bg: "bg-amber-100" },
  offer: { label: "Offer", color: "text-green-600", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-100" },
  ghosted: { label: "Ghosted", color: "text-gray-500", bg: "bg-gray-100" },
};

const STATUSES = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value: value as ApplicationStatus,
  label: cfg.label,
}));

export default function ApplicationDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "applications", id), (snap) => {
      if (!snap.exists()) { setApp(null); return; }
      const data = { id: snap.id, ...(snap.data() as Omit<Application, "id">) };
      setApp(data);
      setNotes(data.notes ?? "");
    });
  }, [id]);

  const updateStatus = async (status: string | null) => {
    if (!id || !status) return;
    await updateDoc(doc(db, "applications", id), { status, updatedAt: serverTimestamp() });
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setNotesSaved(false);
    if (saveTimer) clearTimeout(saveTimer);
    const t = setTimeout(async () => {
      await updateDoc(doc(db, "applications", id!), { notes: val, updatedAt: serverTimestamp() });
      setNotesSaved(true);
    }, 1500);
    setSaveTimer(t);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this application?")) return;
    await deleteDoc(doc(db, "applications", id));
    router.push("/dashboard/applications");
  };

  if (app === undefined) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
=======
  Textarea,
} from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

interface Application {
  id: string;
  company: string;
  role: string;
  status: "applied" | "interviewing" | "offered" | "rejected" | "accepted";
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
      </div>
    );
  }

<<<<<<< HEAD
  if (app === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-medium">Application not found</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/applications")}>
          Back to applications
=======
  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
        </Button>
      </div>
    );
  }

<<<<<<< HEAD
  const statusCfg = STATUS_CONFIG[app.status];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/dashboard/applications")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{app.companyName}</h1>
            <p className="text-muted-foreground text-sm">{app.roleTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {app.jobUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(app.jobUrl, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Job posting
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-xl border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Status</span>
              <Select value={app.status} onValueChange={updateStatus}>
                <SelectTrigger className="h-7 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">
                Applied {new Date(app.appliedAt).toLocaleDateString()}
              </span>
            </div>
            {app.location && (
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{app.location}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Source:</span>
              <Badge variant="secondary" className="capitalize">
                {app.source}
              </Badge>
            </div>
            {app.salaryRange && (
              <div className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{app.salaryRange}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Notes</h2>
          <span
            className={cn(
              "text-xs",
              notesSaved ? "text-muted-foreground" : "text-amber-500",
            )}
          >
            {notesSaved ? "Saved" : "Saving…"}
          </span>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add notes about this application — interviews, contacts, follow-ups…"
          rows={8}
        />
      </div>
=======
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
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={application.url} target="_blank" rel="noopener noreferrer">
                      View <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    </div>
  );
}
