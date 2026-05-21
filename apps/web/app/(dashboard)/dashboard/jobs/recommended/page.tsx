import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function RecommendedJobsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recommended Jobs</h1>
        <p className="text-muted-foreground text-sm">AI-matched jobs based on your profile and resume.</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <Sparkles className="text-muted-foreground h-10 w-10" />
          <div className="space-y-1">
            <p className="font-medium">AI job recommendations coming soon</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              Complete your profile and upload a resume so we can match you with relevant roles.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link href="/onboarding/profile" />}>
              Complete profile
            </Button>
            <Button size="sm" render={<Link href="/dashboard/resumes" />}>
              Manage resumes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
