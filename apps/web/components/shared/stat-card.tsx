import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, delta, icon: Icon, className }: StatCardProps): React.ReactElement {
  const isPositive = delta !== undefined && delta >= 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta !== undefined && (
          <p className={cn("mt-1 flex items-center text-xs font-medium", isPositive && "text-success", isNegative && "text-destructive")}>
            {isPositive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {Math.abs(delta)}%
            <span className="text-muted-foreground ml-1 font-normal">vs last week</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
