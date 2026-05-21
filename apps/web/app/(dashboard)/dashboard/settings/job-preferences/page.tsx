"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface JobPreferences {
  titles: string[];
  locations: string[];
  openToRemote: boolean;
  salaryCurrency: string;
  salaryMin: number;
  salaryMax: number;
  employmentTypes: string[];
  industries: string[];
  excludeCompanies: string[];
  excludeKeywords: string[];
}

const EMPLOYMENT_TYPES = ["Full-time", "Contract", "Part-time", "Internship", "Freelance"];

const DEFAULT: JobPreferences = {
  titles: [],
  locations: [],
  openToRemote: false,
  salaryCurrency: "USD",
  salaryMin: 0,
  salaryMax: 200000,
  employmentTypes: [],
  industries: [],
  excludeCompanies: [],
  excludeKeywords: [],
};

export default function JobPreferencesPage(): React.ReactElement {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<JobPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [excludeCompanyInput, setExcludeCompanyInput] = useState("");
  const [excludeKeywordInput, setExcludeKeywordInput] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "jobPreferences", user.uid)).then((snap) => {
      setPrefs(snap.exists() ? (snap.data() as JobPreferences) : DEFAULT);
    });
  }, [user]);

  const update = <K extends keyof JobPreferences>(key: K, value: JobPreferences[K]) => {
    setPrefs((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  };

  const addTag = (key: "titles" | "locations" | "excludeCompanies" | "excludeKeywords", val: string, clear: () => void) => {
    if (!val.trim() || !prefs) return;
    update(key, [...prefs[key], val.trim()]);
    clear();
  };

  const removeTag = (key: "titles" | "locations" | "excludeCompanies" | "excludeKeywords", val: string) => {
    if (!prefs) return;
    update(key, prefs[key].filter((v) => v !== val));
  };

  const toggleEmployment = (type: string) => {
    if (!prefs) return;
    const next = prefs.employmentTypes.includes(type)
      ? prefs.employmentTypes.filter((t) => t !== type)
      : [...prefs.employmentTypes, type];
    update("employmentTypes", next);
  };

  const save = async () => {
    if (!user || !prefs) return;
    setSaving(true);
    await setDoc(doc(db, "jobPreferences", user.uid), { ...prefs, updatedAt: serverTimestamp() });
    setSaving(false);
    setSaved(true);
  };

  if (prefs === null) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    );
  }

  const TagInput = ({
    label, tags, inputVal, setInputVal, tagKey,
  }: {
    label: string;
    tags: string[];
    inputVal: string;
    setInputVal: (v: string) => void;
    tagKey: "titles" | "locations" | "excludeCompanies" | "excludeKeywords";
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(tagKey, inputVal, () => setInputVal("")); }
          }}
          placeholder="Type and press Enter"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addTag(tagKey, inputVal, () => setInputVal(""))}
          disabled={!inputVal.trim()}
        >
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => removeTag(tagKey, tag)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Job preferences</h2>
        <p className="text-muted-foreground text-sm">Used for job matching and recommendations.</p>
      </div>

      <TagInput
        label="Target job titles"
        tags={prefs.titles}
        inputVal={titleInput}
        setInputVal={setTitleInput}
        tagKey="titles"
      />

      <div className="space-y-3">
        <TagInput
          label="Preferred locations"
          tags={prefs.locations}
          inputVal={locationInput}
          setInputVal={setLocationInput}
          tagKey="locations"
        />
        <div className="flex items-center gap-2">
          <Switch
            id="remote"
            checked={prefs.openToRemote}
            onCheckedChange={(v) => update("openToRemote", v)}
          />
          <Label htmlFor="remote">Open to remote</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Employment types</Label>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleEmployment(type)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                prefs.employmentTypes.includes(type)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Salary range ({prefs.salaryCurrency})</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={prefs.salaryMin}
            onChange={(e) => update("salaryMin", Number(e.target.value))}
            className="w-32"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            value={prefs.salaryMax}
            onChange={(e) => update("salaryMax", Number(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <p className="font-medium text-sm">Dealbreakers</p>
        <TagInput
          label="Companies to exclude"
          tags={prefs.excludeCompanies}
          inputVal={excludeCompanyInput}
          setInputVal={setExcludeCompanyInput}
          tagKey="excludeCompanies"
        />
        <TagInput
          label="Keywords to exclude"
          tags={prefs.excludeKeywords}
          inputVal={excludeKeywordInput}
          setInputVal={setExcludeKeywordInput}
          tagKey="excludeKeywords"
        />
      </div>

      <Button onClick={() => void save()} disabled={saving}>
        {saved ? "Saved" : saving ? "Saving…" : "Save preferences"}
      </Button>
    </div>
  );
}
