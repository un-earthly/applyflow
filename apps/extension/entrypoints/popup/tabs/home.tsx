import { useState, useEffect } from 'react';
import { Button } from '../components/button';

export default function HomeTab() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({ used: 0, total: 50 });
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
        setIsLoggedIn(response?.isLoggedIn ?? false);
        setFirstName(response?.user?.displayName?.split(' ')[0] ?? '');
        setQuota(response?.quota ?? { used: 0, total: 50 });
      } catch (error) {
        console.error('Failed to check auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold mb-2">Welcome to ApplyFlow</h2>
          <p className="text-sm text-muted-foreground">Sign in to get started with AI-powered job applications.</p>
        </div>
        <Button
          className="w-full"
          onClick={() => {
            chrome.tabs.create({ url: 'http://localhost:3000/login?return=extension' });
          }}
        >
          Sign in
        </Button>
      </div>
    );
  }

  const quotaPercentage = (quota.used / quota.total) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Hey {firstName}! 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Ready to apply smarter?</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Autofills remaining this month</span>
          <span className="text-primary font-semibold">{quota.total - quota.used} / {quota.total}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-sm"
          onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/dashboard/jobs' })}
        >
          Browse recommended jobs
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-sm"
          onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/dashboard/applications' })}
        >
          View applications
        </Button>
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
        💡 Tip: Open any LinkedIn, Indeed, or Greenhouse job application page and we'll detect it automatically.
      </div>
    </div>
  );
}
