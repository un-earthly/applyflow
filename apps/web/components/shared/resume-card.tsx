import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Resume } from "@repo/shared";
import { FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeCardProps {
  resume: Resume;
  className?: string;
  onClick?: () => void;
}

export function ResumeCard({ resume, className, onClick }: ResumeCardProps): React.ReactElement {
  const lastEdited = new Date(resume.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={cn("cursor-pointer transition-colors hover:bg-muted/50", className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
            <FileText className="text-muted-foreground h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-semibold text-sm">{resume.name}</h4>
              {resume.isDefault && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Edited {lastEdited}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
