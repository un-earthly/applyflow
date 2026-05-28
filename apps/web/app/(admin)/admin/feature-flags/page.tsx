"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  updatedAt?: { seconds: number };
}

export default function AdminFeatureFlagsPage(): React.ReactElement {
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    getDocs(collection(db, "featureFlags")).then((snap) => {
      setFlags(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FeatureFlag, "id">) })));
    });
  };

  useEffect(() => { load(); }, []);

  const toggle = async (flag: FeatureFlag) => {
    await setDoc(doc(db, "featureFlags", flag.id), { ...flag, enabled: !flag.enabled, updatedAt: serverTimestamp() });
    load();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "featureFlags", id));
    load();
  };

  const create = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const id = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await setDoc(doc(db, "featureFlags", id), {
      name: newName.trim(),
      description: newDesc.trim() || null,
      enabled: false,
      updatedAt: serverTimestamp(),
    });
    setNewName("");
    setNewDesc("");
    setOpen(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Feature flags</h1>
          <p className="text-muted-foreground text-sm">Toggle features for all users.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New flag
        </Button>
      </div>

      <div className="rounded-lg border divide-y">
        {flags === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          ))
        ) : flags.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm">
            No feature flags yet. Create one to get started.
          </div>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between px-4 py-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{flag.name}</span>
                  <Badge variant="outline" className="font-mono text-xs">{flag.id}</Badge>
                </div>
                {flag.description && (
                  <p className="text-muted-foreground text-xs">{flag.description}</p>
                )}
                {flag.updatedAt && (
                  <p className="text-muted-foreground text-xs">
                    Updated {new Date(flag.updatedAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={() => void toggle(flag)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void remove(flag.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New feature flag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="flag-name">Name</Label>
              <Input
                id="flag-name"
                placeholder="AI Cover Letters"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flag-desc">Description</Label>
              <Textarea
                id="flag-desc"
                placeholder="What does this flag control?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} disabled={!newName.trim() || saving}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
