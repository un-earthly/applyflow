"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, deleteDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, MoreVertical, Trash2 } from "lucide-react";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import { TemplatePreview } from "@/components/resume/template-preview";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import type { ResumeDoc } from "./types";

export function ResumeCard({ resume }: { resume: ResumeDoc }): React.ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const tpl = RESUME_TEMPLATES.find((t) => t.id === resume.templateId) ?? RESUME_TEMPLATES[0]!;

  async function handleDelete() {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "resumes", resume.id));
  }

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/dashboard/resumes/${resume.id}/edit`)}
    >
      <div className="relative overflow-hidden bg-muted/20" style={{ height: 180 }}>
        <TemplatePreview template={tpl} scale={0.226} />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{resume.name}</div>
          <div className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: tpl.accent }} />
            {tpl.name} · {resume.updatedAt ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString() : "New"}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {resume.isDefault && (
            <Badge variant="secondary" className="text-[10px] py-0">
              <Star className="mr-1 h-2.5 w-2.5 fill-current" />Default
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/edit`); }}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/preview`); }}>Preview</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/tailor`); }}>Tailor for Job</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/versions`); }}>Version History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete resume?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{resume.name}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
