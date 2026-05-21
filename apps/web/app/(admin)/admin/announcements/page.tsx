"use client";

import { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success";
  targeting: "all" | "free" | "pro";
  active: boolean;
  createdAt?: { seconds: number };
}

export default function AdminAnnouncementsPage(): React.ReactElement {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<Announcement["type"]>("info");
  const [targeting, setTargeting] = useState<Announcement["targeting"]>("all");
  const [saving, setSaving] = useState(false);

  const load = () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, "id">) })));
    });
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "announcements"), {
      title: title.trim(),
      body: body.trim(),
      type,
      targeting,
      active: true,
      createdAt: serverTimestamp(),
    });
    setTitle(""); setBody(""); setType("info"); setTargeting("all");
    setOpen(false);
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "announcements", id));
    load();
  };

  const TYPE_BADGE: Record<Announcement["type"], "default" | "secondary" | "destructive"> = {
    info: "secondary",
    warning: "destructive",
    success: "default",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="text-muted-foreground text-sm">In-app banners shown to users.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New announcement
        </Button>
      </div>

      {items === null ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Megaphone className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-sm text-muted-foreground">No announcements. Create one to show a banner to users.</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.title}</span>
                  <Badge variant={TYPE_BADGE[item.type]} className="text-xs">{item.type}</Badge>
                  <Badge variant="outline" className="text-xs">Target: {item.targeting}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.body}</p>
                {item.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void remove(item.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's new?" />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Announcement["type"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Targeting</Label>
                <Select value={targeting} onValueChange={(v) => setTargeting(v as Announcement["targeting"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="free">Free only</SelectItem>
                    <SelectItem value="pro">Pro only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} disabled={!title.trim() || !body.trim() || saving}>
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
