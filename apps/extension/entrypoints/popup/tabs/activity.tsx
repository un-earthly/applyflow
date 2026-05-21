import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  company: string;
  role: string;
  status: 'filled' | 'submitted' | 'queued' | 'failed';
  timestamp: Date;
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
        <div key={activity.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">{activity.company}</p>
              <p className="text-xs text-muted-foreground">{activity.role}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(activity.status)}`}>
              {activity.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {activity.timestamp.toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
}
