"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Resume {
  id: string;
  name: string;
  basics: { name: string };
}

export default function TailorResumePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [tailoring, setTailoring] = useState(false);
  const [tailoredContent, setTailoredContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || !params.id) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "resumes", params.id as string),
      (doc) => {
        if (doc.exists()) {
          setResume({ id: doc.id, ...doc.data() } as Resume);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, params.id]);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Error", description: "Please paste a job description" });
      return;
    }

    setTailoring(true);
    try {
      // TODO: Call AI service to tailor resume
      setTailoredContent("AI-tailored content will appear here...");
      toast({ title: "Success", description: "Resume tailored" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to tailor resume" });
    } finally {
      setTailoring(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tailoredContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="max-w-4xl mx-auto py-10">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tailor Resume</h1>
          <p className="text-muted-foreground">Customize {resume.name} for a specific job</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Job Description
            </CardTitle>
            <CardDescription>Paste the job posting here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Copy and paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="resize-none"
            />
            <Button onClick={handleTailor} disabled={tailoring || !jobDescription.trim()} className="w-full">
              {tailoring ? "Tailoring..." : "Tailor Resume"}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>Optimized content for this job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tailoredContent ? (
              <>
                <div className="bg-muted p-4 rounded-lg min-h-96 text-sm whitespace-pre-wrap">
                  {tailoredContent}
                </div>
                <Button onClick={copyToClipboard} className="w-full" variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="bg-muted p-4 rounded-lg min-h-96 flex items-center justify-center text-muted-foreground">
                AI suggestions will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
