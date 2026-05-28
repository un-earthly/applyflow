import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, ExternalLink } from "lucide-react";

interface ActivityItem {
  id: string;
  company: string;
  role: string;
  url: string;
  status: "filled" | "submitted" | "queued" | "failed";
  timestamp: number;
}

type FilterType = "all" | "submitted" | "queued" | "failed";

const STATUS_CONFIG = {
  filled: { icon: CheckCircle2, color: "text-green-500", label: "Filled" },
  submitted: { icon: CheckCircle2, color: "text-blue-500", label: "Submitted" },
  queued: { icon: Clock, color: "text-amber-500", label: "Queued" },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
};

function groupByDay(items: ActivityItem[]): [string, ActivityItem[]][] {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const day = new Date(item.timestamp).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(item);
  }
  return Array.from(groups.entries());
}

export function ActivityTab(): React.ReactElement {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    browser.storage.local.get(["activityLog"]).then((result) => {
      setActivity((result.activityLog as ActivityItem[] | undefined) ?? []);
    });
  }, []);

  const filtered = filter === "all" ? activity : activity.filter((a) => a.status === filter);
  const grouped = groupByDay(filtered);
  const FILTERS: FilterType[] = ["all", "submitted", "queued", "failed"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 p-3 border-b overflow-x-auto shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          </div>
        ) : (
          grouped.map(([day, items]) => (
            <div key={day}>
              <p className="text-xs font-medium text-muted-foreground px-4 py-2 bg-muted/50 sticky top-0">
                {day}
              </p>
              {items.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50">
                    <cfg.icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.role}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {item.url && (
                        <button onClick={() => browser.tabs.create({ url: item.url })}>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
