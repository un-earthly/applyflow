"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DangerZonePage(): React.ReactElement {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  const wipeCollection = async (collectionName: string) => {
    if (!user) return;
    const q = query(collection(db, collectionName), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  const deleteAccount = async () => {
    if (!user || confirmEmail !== user.email) return;
    setDeleting(true);
    try {
      await wipeCollection("applications");
      await wipeCollection("resumes");
      await wipeCollection("coverLetters");
      await wipeCollection("savedJobs");
      await deleteDoc(doc(db, "profiles", user.uid));
      await user.delete();
      await signOut();
      router.push("/");
    } catch {
      setDeleting(false);
    }
  };

  const DANGER_ACTIONS = [
    {
      label: "Wipe all applications",
      description: "Permanently delete all application records. This cannot be undone.",
      action: () => wipeCollection("applications"),
      confirmLabel: "Delete all applications",
    },
    {
      label: "Wipe all resumes",
      description: "Permanently delete all resumes. This cannot be undone.",
      action: () => wipeCollection("resumes"),
      confirmLabel: "Delete all resumes",
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-lg font-semibold">Danger zone</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        These actions are permanent and cannot be undone. Proceed with caution.
      </p>

      <div className="space-y-0 rounded-lg border border-destructive/30 divide-y divide-destructive/20">
        {DANGER_ACTIONS.map((action) => (
          <div key={action.label} className="flex items-start justify-between gap-6 p-4">
            <div>
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shrink-0">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{action.label}</AlertDialogTitle>
                  <AlertDialogDescription>{action.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => void action.action()}
                  >
                    {action.confirmLabel}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-4 rounded-lg border border-destructive/30 p-4">
        <div>
          <p className="font-semibold text-sm text-destructive">Delete account</p>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently delete your account, profile, and all data. This cannot be undone.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-email" className="text-xs">
            Type your email <span className="font-mono">{user?.email}</span> to confirm
          </Label>
          <Input
            id="confirm-email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={user?.email ?? ""}
          />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={confirmEmail !== user?.email || deleting}
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account, profile, resumes, applications, and all
                associated data. This action cannot be reversed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void deleteAccount()}
              >
                Yes, delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
