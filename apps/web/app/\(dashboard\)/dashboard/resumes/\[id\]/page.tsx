"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  MoreVertical,
  Wand2,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Resume {
  id: string;
  name: string;
  isDefault: boolean;
  updatedAt: { seconds: number } | null;
  basics: {
    name: string;
    label: string;
    email: string;
    phone: string;
    url: string;
    summary: string;
    location: string;
  };
  work: Array<{ position: string; name: string; startDate: string; endDate: string }>;
  education: Array<{ institution: string; area: string; studyType: string }>;
  skills: Array<{ name: string; level: string }>;
  projects: Array<{ name: string; description: string }>;
}

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !params.id) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "resumes", params.id as string),
      (doc) => {
        if (doc.exists()) {
          setResume({ id: doc.id, ...doc.data() } as Resume);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching resume:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <p className="text-muted-foreground mb-4">Resume not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/resumes")}>
          Back to Resumes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{resume.name}</h1>
            <p className="text-sm text-muted-foreground">
              Last updated{" "}
              {resume.updatedAt
                ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/dashboard/resumes/${resume.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/resumes/${resume.id}/tailor`)}>
                <Wand2 className="h-4 w-4 mr-2" />
                Tailor for Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/resumes/${resume.id}/versions`)}>
                <History className="h-4 w-4 mr-2" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basics */}
          {resume.basics.name && (
            <section>
              <h2 className="text-2xl font-bold">{resume.basics.name}</h2>
              {resume.basics.label && <p className="text-lg text-muted-foreground">{resume.basics.label}</p>}
              {resume.basics.summary && <p className="mt-2 text-sm leading-relaxed">{resume.basics.summary}</p>}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {resume.basics.email && <a href={`mailto:${resume.basics.email}`}>{resume.basics.email}</a>}
                {resume.basics.phone && <span>{resume.basics.phone}</span>}
                {resume.basics.location && <span>{resume.basics.location}</span>}
              </div>
            </section>
          )}

          {/* Work */}
          {resume.work.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Experience</h3>
              <div className="space-y-4">
                {resume.work.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{job.position}</p>
                        <p className="text-sm text-muted-foreground">{job.name}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {job.startDate} - {job.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Education</h3>
              <div className="space-y-4">
                {resume.education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-semibold">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.studyType} in {edu.area}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Status</p>
              <p className="text-sm">{resume.isDefault ? "Default resume" : "Not set as default"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Sections</p>
              <ul className="text-sm space-y-1">
                <li>✓ Basics</li>
                {resume.work.length > 0 && <li>✓ Experience ({resume.work.length})</li>}
                {resume.education.length > 0 && <li>✓ Education ({resume.education.length})</li>}
                {resume.skills.length > 0 && <li>✓ Skills ({resume.skills.length})</li>}
                {resume.projects.length > 0 && <li>✓ Projects ({resume.projects.length})</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
