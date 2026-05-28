"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil } from "lucide-react";

interface ResumeData {
  name: string;
  jsonData: {
    basics: {
      name: string;
      label: string;
      email: string;
      phone: string;
      url: string;
      summary: string;
      location: string;
    };
    work: { name: string; position: string; startDate: string; endDate: string; summary: string; url: string }[];
    education: { institution: string; area: string; studyType: string; startDate: string; endDate: string; score: string }[];
    skills: { name: string; level: string; keywords: string }[];
    projects: { name: string; description: string; url: string; highlights: string; startDate: string; endDate: string }[];
  };
}

export default function ResumePreviewPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    return onSnapshot(doc(db, "users", user.uid, "resumes", id), (snap) => {
      if (snap.exists()) setResume(snap.data() as ResumeData);
    });
  }, [id, user]);

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[700px] w-full rounded-xl" />
      </div>
    );
  }

  const { basics: b, work, education, skills, projects } = resume.jsonData;

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/resume/${id}/edit`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to editor
        </Button>
        <Button size="sm" onClick={() => router.push(`/dashboard/resume/${id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Resume card */}
      <div className="rounded-xl border bg-card p-10 shadow-sm print:rounded-none print:border-none print:shadow-none">
        {/* Header */}
        <div className="mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold">{b.name || "Your Name"}</h1>
          {b.label && <p className="text-muted-foreground mt-1 text-lg">{b.label}</p>}
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {b.email && <span>{b.email}</span>}
            {b.phone && <span>{b.phone}</span>}
            {b.location && <span>{b.location}</span>}
            {b.url && (
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">
                {b.url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {b.summary && (
          <section className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</h2>
            <p className="text-sm leading-relaxed">{b.summary}</p>
          </section>
        )}

        {work.filter((w) => w.name).length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Experience</h2>
            <div className="space-y-4">
              {work.filter((w) => w.name).map((w, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{w.position}</p>
                      <p className="text-muted-foreground text-sm">{w.name}</p>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-sm">
                      {[w.startDate, w.endDate].filter(Boolean).join(" – ")}
                    </p>
                  </div>
                  {w.summary && <p className="mt-1.5 text-sm leading-relaxed">{w.summary}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.filter((e) => e.institution).length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Education</h2>
            <div className="space-y-3">
              {education.filter((e) => e.institution).map((e, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{e.institution}</p>
                    <p className="text-muted-foreground text-sm">
                      {[e.studyType, e.area].filter(Boolean).join(", ")}
                      {e.score ? ` · ${e.score}` : ""}
                    </p>
                  </div>
                  <p className="text-muted-foreground shrink-0 text-sm">
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.filter((s) => s.name).length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Skills</h2>
            <div className="space-y-1.5 text-sm">
              {skills.filter((s) => s.name).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="font-medium shrink-0">{s.name}:</span>
                  <span className="text-muted-foreground">{s.keywords}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.filter((p) => p.name).length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Projects</h2>
            <div className="space-y-4">
              {projects.filter((p) => p.name).map((p, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {p.name}
                          </a>
                        ) : p.name}
                      </p>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-sm">
                      {[p.startDate, p.endDate].filter(Boolean).join(" – ")}
                    </p>
                  </div>
                  {p.description && <p className="mt-1 text-sm">{p.description}</p>}
                  {p.highlights && (
                    <p className="text-muted-foreground mt-0.5 text-sm">{p.highlights}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
