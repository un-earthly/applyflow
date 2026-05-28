"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  email?: string;
  userId?: string;
  status: "open" | "in_progress" | "resolved";
  adminReply?: string;
  createdAt?: { seconds: number };
}

export default function AdminSupportDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null | undefined>(undefined);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "supportTickets", id)).then((snap) => {
      if (!snap.exists()) { setTicket(null); return; }
      const data = { id: snap.id, ...(snap.data() as Omit<SupportTicket, "id">) };
      setTicket(data);
      setReply(data.adminReply ?? "");
    });
  }, [id]);

  const save = async (newStatus?: SupportTicket["status"]) => {
    if (!ticket) return;
    setSaving(true);
    await updateDoc(doc(db, "supportTickets", id), {
      adminReply: reply,
      status: newStatus ?? ticket.status,
      updatedAt: serverTimestamp(),
    });
    setTicket((prev) => prev ? { ...prev, adminReply: reply, status: newStatus ?? prev.status } : prev);
    setSaving(false);
  };

  if (ticket === undefined) return <Skeleton className="h-96 w-full rounded-lg" />;
  if (ticket === null) return <p className="text-muted-foreground">Ticket not found.</p>;

  const STATUS_BADGE: Record<SupportTicket["status"], "default" | "secondary" | "outline"> = {
    open: "default",
    in_progress: "secondary",
    resolved: "outline",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{ticket.email}</span>
            <Badge variant={STATUS_BADGE[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">User message</p>
        <p className="text-sm">{ticket.message}</p>
        {ticket.createdAt && (
          <p className="text-xs text-muted-foreground">
            Received {new Date(ticket.createdAt.seconds * 1000).toLocaleString()}
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="reply">Admin reply</label>
        <Textarea
          id="reply"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={6}
          placeholder="Type your reply to the user…"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save reply"}
        </Button>
        {ticket.status !== "resolved" && (
          <Button
            variant="outline"
            onClick={() => void save("resolved")}
            disabled={saving}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark resolved
          </Button>
        )}
      </div>
    </div>
  );
}
