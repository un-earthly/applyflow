import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  type?: string;
  url?: string;
  boardName?: string;
  fieldsCount?: number;
  status?: 'filled' | 'submitted' | 'queued' | 'failed';
  timestamp: string;
}

export default function ActivityTab() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_ACTIVITY_LOG',
          limit: 50,
        });
        setActivities(response?.activities ?? []);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No activity yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Start filling forms to see them here.</p>
      </div>
    );
  }

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-primary/10 text-primary';
      case 'filled':
        return 'bg-blue-50 text-blue-700';
      case 'queued':
        return 'bg-yellow-50 text-yellow-700';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="p-3 bg-muted/50 rounded-lg space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{activity.boardName ?? "Job board"}</p>
              {activity.url && (
                <p className="text-xs text-muted-foreground truncate">{activity.url}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${getStatusColor(activity.status ?? 'filled')}`}>
              {activity.type ?? "fill"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(activity.timestamp).toLocaleString()}
            {activity.fieldsCount ? ` · ${activity.fieldsCount} fields` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
