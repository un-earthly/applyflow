"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverLetter {
  id: string;
  company: string;
  role: string;
  content: string;
  jobDescription?: string;
}

export default function CoverLetterDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "coverLetters", id), (snap) => {
      if (!snap.exists()) { router.replace("/dashboard/cover-letters"); return; }
      const data = { id: snap.id, ...(snap.data() as Omit<CoverLetter, "id">) };
      setLetter(data);
      setContent(data.content);
    });
  }, [id, router]);

  const handleChange = (val: string) => {
    setContent(val);
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      await updateDoc(doc(db, "coverLetters", id!), { content: val, updatedAt: serverTimestamp() });
      setSaveStatus("saved");
    }, 1500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!letter) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/dashboard/cover-letters")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{letter.company}</h1>
            <p className="text-muted-foreground text-sm">{letter.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(saveStatus === "unsaved" && "text-amber-500")}
          >
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[500px] font-mono text-sm leading-relaxed"
        placeholder="Write your cover letter here…"
      />
    </div>
  );
}
