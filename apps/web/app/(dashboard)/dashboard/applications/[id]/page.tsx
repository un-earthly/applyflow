"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ApplicationStatus = "applied" | "screening" | "interview" | "offer" | "rejected" | "ghosted";

interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  url?: string;
  notes?: string;
  source?: string;
  location?: string;
  salaryRange?: string;
  appliedAt: { seconds: number } | string;
  autofillFieldsCount?: number;
  formSnapshot?: Record<string, string>;
}

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  screening: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  interview: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  offer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  ghosted: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_VALUES: ApplicationStatus[] = [
  "applied", "screening", "interview", "offer", "rejected", "ghosted",
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const autosaveRef = useRef<ReturnType<typeof setTimeout>>(null);

  const appId = params.id as string;
  const docRef = user ? doc(db, "users", user.uid, "applications", appId) : null;

  useEffect(() => {
    if (!user || !appId) return;
    return onSnapshot(doc(db, "users", user.uid, "applications", appId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Application;
        setApplication(data);
        setNotes((prev) => (prev === "" ? data.notes ?? "" : prev));
      }
      setLoading(false);
    });
  }, [user, appId]);

  const persistNotes = useCallback(
    async (value: string) => {
      if (!docRef) return;
      setSaveState("saving");
      try {
        await updateDoc(docRef, { notes: value, updatedAt: serverTimestamp() });
        setSaveState("saved");
      } catch {
        setSaveState("unsaved");
      }
    },
    [docRef],
  );

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setSaveState("unsaved");
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => void persistNotes(value), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!docRef || !application) return;
    await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
  };

  const handleDelete = async () => {
    if (!docRef) return;
    await deleteDoc(docRef);
    toast.success("Application deleted");
    router.push("/dashboard/applications");
  };

  const appliedDate =
    application?.appliedAt
      ? typeof application.appliedAt === "string"
        ? new Date(application.appliedAt).toLocaleDateString()
        : new Date(application.appliedAt.seconds * 1000).toLocaleDateString()
      : "—";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-0.5">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold truncate">{application.role}</h1>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium capitalize",
                STATUS_STYLE[application.status],
              )}
            >
              {application.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
            <span>{application.company}</span>
            {application.location && <span>· {application.location}</span>}
            {application.source && (
              <span className="capitalize">· via {application.source}</span>
            )}
            <span>· Applied {appliedDate}</span>
            {application.url && (
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Job posting <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Status</span>
        <Select value={application.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="form">Form snapshot</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 rounded-lg border p-4 text-sm">
            {application.location && (
              <div>
                <p className="text-muted-foreground text-xs">Location</p>
                <p className="font-medium mt-0.5">{application.location}</p>
              </div>
            )}
            {application.salaryRange && (
              <div>
                <p className="text-muted-foreground text-xs">Salary</p>
                <p className="font-medium mt-0.5">{application.salaryRange}</p>
              </div>
            )}
            {application.source && (
              <div>
                <p className="text-muted-foreground text-xs">Source</p>
                <p className="font-medium mt-0.5 capitalize">{application.source}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Applied</p>
              <p className="font-medium mt-0.5">{appliedDate}</p>
            </div>
            {application.autofillFieldsCount !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Fields autofilled</p>
                <p className="font-medium mt-0.5">{application.autofillFieldsCount}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Notes autosave as you type.</p>
            <span className="text-xs text-muted-foreground">
              {saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved" : "Saved"}
            </span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Interview feedback, follow-up reminders, contacts…"
            className="min-h-64 font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="form" className="mt-4">
          {application.formSnapshot && Object.keys(application.formSnapshot).length > 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              {Object.entries(application.formSnapshot).map(([k, v]) => (
                <div key={k} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground w-32 shrink-0 font-mono text-xs">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <p className="font-medium">No form snapshot</p>
              <p className="text-sm mt-1">Form data is captured when the extension fills a job application.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <p className="font-medium">Timeline</p>
            <p className="text-sm mt-1">Status changes and manual events will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the application for {application.role} at {application.company}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
