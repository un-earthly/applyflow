"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewResumePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeName, setResumeName] = useState("");

  const createBlankResume = async () => {
    if (!user || !resumeName.trim()) {
      toast({ title: "Error", description: "Please enter a resume name" });
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "resumes"), {
        name: resumeName,
        isDefault: false,
        basics: {
          name: "",
          label: "",
          email: user.email || "",
          phone: "",
          url: "",
          summary: "",
          location: "",
        },
        work: [],
        education: [],
        skills: [],
        projects: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Success", description: "Resume created" });
      router.push(`/dashboard/resumes/${docRef.id}/edit`);
    } catch (error) {
      console.error("Error creating resume:", error);
      toast({ title: "Error", description: "Failed to create resume" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Resume</h1>
        <p className="text-muted-foreground">Start with a blank resume or upload an existing one</p>
      </div>

      <Tabs defaultValue="blank" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blank">Blank</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="duplicate">Duplicate</TabsTrigger>
        </TabsList>

        <TabsContent value="blank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Blank Resume
              </CardTitle>
              <CardDescription>Start with a fresh resume and build from scratch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resume Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Software Engineer Resume"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                />
              </div>
              <Button onClick={createBlankResume} disabled={loading || !resumeName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Resume"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Resume
              </CardTitle>
              <CardDescription>Upload a PDF or DOCX file to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Upload feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Duplicate Resume
              </CardTitle>
              <CardDescription>Create a copy of an existing resume</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Duplicate feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
