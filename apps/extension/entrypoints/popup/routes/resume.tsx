import { useState, useEffect } from "react";
import { FileText, ExternalLink, Sparkles } from "lucide-react";

interface ResumeInfo {
  id: string;
  name: string;
}

export function ResumeTab(): React.ReactElement {
  const [resumes, setResumes] = useState<ResumeInfo[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [jd, setJd] = useState("");
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const WEB_URL = import.meta.env.VITE_WEB_URL ?? "https://app.applyflow.io";

  useEffect(() => {
    browser.storage.local.get(["resumeCache", "defaultResumeId"]).then((result) => {
      const cache = result.resumeCache as ResumeInfo[] | undefined;
      setResumes(cache ?? []);
      setCurrent((result.defaultResumeId as string | undefined) ?? null);
    });
  }, []);

  const handleSwitch = async (id: string) => {
    setCurrent(id);
    await browser.storage.local.set({ defaultResumeId: id });
  };

  const handleGenerate = async () => {
    if (!jd.trim() || !current) return;
    setGenerating(true);
    try {
      const resp = await browser.runtime.sendMessage({
        type: "GENERATE_COVER_LETTER",
        resumeId: current,
        jobDescription: jd,
      });
      setCoverLetter((resp as { coverLetter: string }).coverLetter ?? "");
    } catch {
      setCoverLetter("Failed to generate. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const currentResume = resumes.find((r) => r.id === current);

  return (
    <div className="p-4 space-y-5">
      {/* Current resume */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">{currentResume?.name ?? "No resume selected"}</p>
        </div>
        {current && (
          <button
            onClick={() => browser.tabs.create({ url: `${WEB_URL}/dashboard/resume/${current}/edit` })}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open editor
          </button>
        )}
      </div>

      {/* Switch resume */}
      {resumes.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Switch resume</p>
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => void handleSwitch(r.id)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                r.id === current ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Cover letter quick-gen */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Quick cover letter</p>
        <textarea
          className="w-full rounded-md border bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          rows={4}
          placeholder="Paste job description…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
        {!coverLetter ? (
          <button
            onClick={() => void handleGenerate()}
            disabled={generating || !jd.trim()}
            className="flex items-center gap-2 w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 justify-center"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating…" : "Generate"}
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border bg-muted px-3 py-2 text-xs resize-none focus:outline-none"
              rows={8}
              readOnly
              value={coverLetter}
            />
            <div className="flex gap-2">
              <button
                onClick={() => void navigator.clipboard.writeText(coverLetter)}
                className="flex-1 border rounded-md py-1.5 text-xs hover:bg-muted"
              >
                Copy
              </button>
              <button
                onClick={() => setCoverLetter("")}
                className="flex-1 border rounded-md py-1.5 text-xs hover:bg-muted"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
