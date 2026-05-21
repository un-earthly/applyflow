"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db, storage } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumePage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
      setFile(f);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!user || !file) return;
    setUploading(true);

    const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100);
      },
      () => setUploading(false),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await setDoc(
          doc(db, "profiles", user.uid),
          { resumeUrl: url, resumeName: file.name, updatedAt: new Date() },
          { merge: true },
        );
        router.push("/onboarding/preferences");
      },
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Add your resume</h1>
        <p className="text-muted-foreground text-sm">
          Upload a base resume — ApplyFlow will tailor it per job automatically.
        </p>
      </div>

      <div className="space-y-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors",
            dragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/30",
            file ? "border-primary/50" : "",
          )}
        >
          {file ? (
            <>
              <FileText className="text-primary h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="text-muted-foreground h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Drop your PDF here</p>
                <p className="text-muted-foreground text-xs">or click to browse</p>
              </div>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {uploading && <Progress value={uploadProgress} className="h-1.5" />}

      <div className="space-y-2">
        {file ? (
          <Button className="w-full" onClick={handleUpload} disabled={uploading}>
            {uploading ? `Uploading… ${Math.round(uploadProgress)}%` : "Upload and continue"}
          </Button>
        ) : (
          <Button className="w-full" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Choose PDF
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/onboarding/preferences")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Start from scratch in the editor
        </Button>
      </div>
    </div>
  );
}
