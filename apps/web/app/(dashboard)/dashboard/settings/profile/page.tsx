"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/use-auth";
import { auth, db, storage } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Camera } from "lucide-react";

export default function ProfileSettingsPage(): React.ReactElement {
  const { user } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    location: "",
    phone: "",
    linkedin: "",
    portfolio: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, displayName: user.displayName ?? "" }));
    getDoc(doc(db, "profiles", user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setForm((f) => ({
          ...f,
          location: d.location ?? "",
          phone: d.phone ?? "",
          linkedin: d.linkedin ?? "",
          portfolio: d.portfolio ?? "",
        }));
      }
    });
  }, [user]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: form.displayName });
      await setDoc(
        doc(db, "profiles", user.uid),
        { ...form, fullName: form.displayName, updatedAt: new Date() },
        { merge: true },
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const storageRef = ref(storage, `avatars/${user.uid}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on("state_changed", undefined, () => setUploading(false), async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      await updateProfile(auth.currentUser!, { photoURL: url });
      setUploading(false);
    });
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Profile</h2>
        <p className="text-muted-foreground text-sm">Your public-facing identity.</p>
      </div>
      <Separator />

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoURL ?? undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            {uploading ? (
              <span className="text-xs">…</span>
            ) : (
              <Camera className="h-3 w-3" />
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="font-medium">{user?.displayName ?? "User"}</p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.displayName} onChange={set("displayName")} placeholder="Jane Smith" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={set("location")} placeholder="San Francisco, CA" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input id="linkedin" type="url" value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="portfolio">Portfolio / website</Label>
          <Input id="portfolio" type="url" value={form.portfolio} onChange={set("portfolio")} placeholder="https://…" />
        </div>
      </div>

      {saved && (
        <Alert>
          <AlertDescription>Profile saved successfully.</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
