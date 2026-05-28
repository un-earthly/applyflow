"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WORK_AUTH_OPTIONS = [
  { value: "citizen", label: "US Citizen / Permanent Resident" },
  { value: "visa", label: "Visa required (H1B, OPT, etc.)" },
  { value: "other", label: "Other / Not applicable" },
];

const EXPERIENCE_OPTIONS = [
  { value: "0", label: "Student / No experience" },
  { value: "1", label: "0–1 years" },
  { value: "3", label: "1–3 years" },
  { value: "5", label: "3–5 years" },
  { value: "8", label: "5–10 years" },
  { value: "10", label: "10+ years" },
];

export default function ProfilePage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: user?.displayName ?? "",
    location: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    workAuth: "",
    yearsOfExperience: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string | null) =>
    setForm((f) => ({ ...f, [key]: val ?? "" }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, "profiles", user.uid),
        { ...form, updatedAt: new Date() },
        { merge: true },
      );
      router.push("/onboarding/resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground text-sm">
          This information pre-fills job applications automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location")(e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            type="url"
            value={form.linkedin}
            onChange={(e) => set("linkedin")(e.target.value)}
            placeholder="https://linkedin.com/in/janesmith"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="portfolio">Portfolio / website</Label>
          <Input
            id="portfolio"
            type="url"
            value={form.portfolio}
            onChange={(e) => set("portfolio")(e.target.value)}
            placeholder="https://janesmith.dev"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Work authorization</Label>
            <Select value={form.workAuth} onValueChange={set("workAuth")}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {WORK_AUTH_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Years of experience</Label>
            <Select
              value={form.yearsOfExperience}
              onValueChange={set("yearsOfExperience")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? "Saving…" : "Save and continue"}
      </Button>
    </div>
  );
}
