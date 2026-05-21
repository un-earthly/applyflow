"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
<<<<<<< HEAD
=======
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
<<<<<<< HEAD

const STATUSES = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
];

const SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "lever", label: "Lever" },
  { value: "workday", label: "Workday" },
  { value: "direct", label: "Direct / company site" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

export default function NewApplicationPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    roleTitle: "",
    jobUrl: "",
    source: "direct",
    status: "applied",
    location: "",
    salaryRange: "",
    notes: "",
    appliedAt: new Date().toISOString().split("T")[0],
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSelect = (key: keyof typeof form) => (val: string | null) =>
    setForm((f) => ({ ...f, [key]: val ?? "" }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "applications"), {
        ...form,
        userId: user.uid,
        appliedAt: form.appliedAt || new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push(`/dashboard/applications/${ref.id}`);
=======
import { useToast } from "@/hooks/use-toast";

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company.trim() || !role.trim()) {
      toast({ title: "Error", description: "Please fill in required fields" });
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "applications"),
        {
          company: company.trim(),
          role: role.trim(),
          url: url.trim() || undefined,
          status,
          notes: notes.trim() || undefined,
          appliedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }
      );

      toast({ title: "Success", description: "Application created" });
      router.push(`/dashboard/applications/${docRef.id}`);
    } catch (error) {
      console.error("Error creating application:", error);
      toast({ title: "Error", description: "Failed to create application" });
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/dashboard/applications")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Add application</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={form.companyName}
              onChange={set("companyName")}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              value={form.roleTitle}
              onChange={set("roleTitle")}
              placeholder="Software Engineer"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jobUrl">Job URL</Label>
          <Input
            id="jobUrl"
            type="url"
            value={form.jobUrl}
            onChange={set("jobUrl")}
            placeholder="https://…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={setSelect("status")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={form.source} onValueChange={setSelect("source")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={set("location")}
              placeholder="San Francisco, CA"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salary">Salary range</Label>
            <Input
              id="salary"
              value={form.salaryRange}
              onChange={set("salaryRange")}
              placeholder="$120k – $150k"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="appliedAt">Date applied</Label>
          <Input
            id="appliedAt"
            type="date"
            value={form.appliedAt}
            onChange={set("appliedAt")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={set("notes")}
            placeholder="Any notes about this application…"
            rows={4}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save application"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/applications")}
          >
            Cancel
          </Button>
        </div>
      </form>
=======
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Application</h1>
          <p className="text-muted-foreground">Track a new job application</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Fill in the details about your job application</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="e.g., Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Position *</Label>
              <Input
                id="role"
                placeholder="e.g., Senior Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Job Posting URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/jobs/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details about the application..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    </div>
  );
}
