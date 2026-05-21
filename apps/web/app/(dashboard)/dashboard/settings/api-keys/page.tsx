"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key, Copy, Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: { seconds: number };
  lastUsedAt: { seconds: number } | null;
  scopes: string[];
}

const SCOPES = ["read:resumes", "write:resumes", "read:applications", "write:applications", "read:profile"];

function generateKey(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return "apf_" + Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function ApiKeysPage(): React.ReactElement {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read:resumes", "read:applications"]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!user) return;
    const q = query(collection(db, "apiKeys"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    setKeys(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ApiKey, "id">) })));
  };

  useEffect(() => { void load(); }, [user]);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setCreating(true);
    const key = generateKey();
    const prefix = key.slice(0, 12) + "…";
    await addDoc(collection(db, "apiKeys"), {
      userId: user.uid,
      name: name.trim(),
      prefix,
      keyHash: key,
      scopes,
      createdAt: serverTimestamp(),
      lastUsedAt: null,
    });
    setNewKey(key);
    setCreating(false);
    void load();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "apiKeys", id));
    void load();
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API keys</h2>
          <p className="text-sm text-muted-foreground">Manage keys for programmatic access. Pro feature.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setNewKey(null); setName(""); } }}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Create key
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Copy this key now — it won&apos;t be shown again.
                </p>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                  <code className="flex-1 text-xs font-mono break-all">
                    {showKey ? newKey : newKey.slice(0, 16) + "•".repeat(30)}
                  </code>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => copy(newKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && <p className="text-xs text-green-600">Copied!</p>}
                <Button className="w-full" onClick={() => { setOpen(false); setNewKey(null); setName(""); }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Key name</Label>
                  <Input
                    placeholder="e.g. My integration"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  {SCOPES.map((scope) => (
                    <label key={scope} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={scopes.includes(scope)}
                        onChange={(e) => {
                          setScopes(e.target.checked ? [...scopes, scope] : scopes.filter((s) => s !== scope));
                        }}
                      />
                      <code className="text-xs">{scope}</code>
                    </label>
                  ))}
                </div>
                <Button
                  className="w-full"
                  disabled={!name.trim() || creating}
                  onClick={() => void handleCreate()}
                >
                  {creating ? "Creating…" : "Create key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {keys === null ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Key className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-sm">No API keys yet</p>
          <p className="text-muted-foreground text-xs mt-1">Create a key to access the ApplyFlow API.</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {keys.map((key) => (
            <div key={key.id} className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-1">
                <p className="font-medium text-sm">{key.name}</p>
                <code className="text-xs text-muted-foreground">{key.prefix}</code>
                <div className="flex flex-wrap gap-1 mt-1">
                  {key.scopes.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs py-0">{s}</Badge>
                  ))}
                </div>
                {key.lastUsedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last used {new Date(key.lastUsedAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => void handleDelete(key.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
