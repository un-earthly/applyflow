import { Card, CardContent } from "@/components/ui/card";
import { ApplicationStatusBadge } from "./application-status-badge";
import type { Application } from "@repo/shared";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: Application;
  className?: string;
  onClick?: () => void;
}

export function ApplicationCard({ application, className, onClick }: ApplicationCardProps): React.ReactElement {
  const daysSinceApplied = Math.floor(
    (Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      className={cn("cursor-pointer transition-colors hover:bg-muted/50", className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold text-sm">{application.roleTitle}</h4>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <Briefcase className="h-3 w-3" />
              {application.companyName}
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {application.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {daysSinceApplied === 0 ? "Today" : `${daysSinceApplied}d ago`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
