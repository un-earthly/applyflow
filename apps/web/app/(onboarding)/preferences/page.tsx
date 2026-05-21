"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

const REMOTE_TYPES = [
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "onsite", label: "On-site" },
];

export default function PreferencesPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  const [titleInput, setTitleInput] = useState("");
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(["full-time"]);
  const [remoteTypes, setRemoteTypes] = useState<string[]>(["remote", "hybrid"]);
  const [loading, setLoading] = useState(false);

  const addTag = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (trimmed) {
      setter((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      inputSetter("");
    }
  };

  const removeTag = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => setter((prev) => prev.filter((t) => t !== value));

  const toggleCheck = (
    id: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) =>
    setter(
      list.includes(id) ? list.filter((t) => t !== id) : [...list, id],
    );

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          preferences: {
            jobTitles,
            locations,
            salaryMin: salaryMin ? Number(salaryMin) : null,
            salaryMax: salaryMax ? Number(salaryMax) : null,
            employmentTypes,
            remoteTypes,
          },
          updatedAt: new Date(),
        },
        { merge: true },
      );
      router.push("/onboarding/install-extension");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Job preferences</h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ll use these to surface the right opportunities and pre-filter
          searches.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label>Job titles you&apos;re targeting</Label>
          <div className="flex gap-2">
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Product Manager"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(titleInput, setJobTitles, setTitleInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag(titleInput, setJobTitles, setTitleInput)}
            >
              Add
            </Button>
          </div>
          {jobTitles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {jobTitles.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 pr-1">
                  {t}
                  <button
                    onClick={() => removeTag(t, setJobTitles)}
                    className="rounded-sm opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Preferred locations</Label>
          <div className="flex gap-2">
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. New York, NY or Remote"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(locationInput, setLocations, setLocationInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag(locationInput, setLocations, setLocationInput)}
            >
              Add
            </Button>
          </div>
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {locations.map((l) => (
                <Badge key={l} variant="secondary" className="gap-1 pr-1">
                  {l}
                  <button
                    onClick={() => removeTag(l, setLocations)}
                    className="rounded-sm opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Salary range (annual, USD)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="Min"
              className="w-full"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="Max"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Employment type</Label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {EMPLOYMENT_TYPES.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <Checkbox
                  id={t.id}
                  checked={employmentTypes.includes(t.id)}
                  onCheckedChange={() =>
                    toggleCheck(t.id, employmentTypes, setEmploymentTypes)
                  }
                />
                <Label htmlFor={t.id} className="cursor-pointer font-normal">
                  {t.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Work location</Label>
          <div className="flex gap-6">
            {REMOTE_TYPES.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <Checkbox
                  id={`remote-${t.id}`}
                  checked={remoteTypes.includes(t.id)}
                  onCheckedChange={() =>
                    toggleCheck(t.id, remoteTypes, setRemoteTypes)
                  }
                />
                <Label htmlFor={`remote-${t.id}`} className="cursor-pointer font-normal">
                  {t.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? "Saving…" : "Save and continue"}
      </Button>
    </div>
  );
}
