"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { NewResumeDialog } from "./new-resume-dialog";
import { UploadDialog } from "./upload-dialog";
import { newResumeDialogOpenAtom, uploadDialogOpenAtom } from "./resume-dialog-atoms";

export function ResumeDialogs(): React.ReactElement {
  const router = useRouter();
  const [newOpen, setNewOpen] = useAtom(newResumeDialogOpenAtom);
  const [uploadOpen, setUploadOpen] = useAtom(uploadDialogOpenAtom);

  const navigate = (id: string) => router.push(`/dashboard/resumes/${id}/edit`);

  return (
    <>
      <NewResumeDialog open={newOpen} onOpenChange={setNewOpen} onCreated={navigate} />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onCreated={navigate} />
    </>
  );
}
