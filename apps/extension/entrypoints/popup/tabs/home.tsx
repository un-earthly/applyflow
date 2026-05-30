import { useState, useEffect } from 'react';
import { ExternalLink, Zap, LayoutDashboard } from 'lucide-react';
import type { AuthState } from '../App';

const APP_URL = import.meta.env.WXT_APP_URL ?? 'https://app.applyflow.io';

interface ActivityItem {
  id: string;
  url?: string;
  boardName?: string;
  timestamp: string;
  status?: string;
}

interface Stats {
  today: number;
  queued: number;
  month: number;
  recent: ActivityItem[];
}

const BOARD_COLORS: Record<string, string> = {
  linkedin:   '#0077B5',
  indeed:     '#2164f3',
  greenhouse: '#3cba4d',
  lever:      '#1a1a1a',
  workday:    '#005a92',
  ashby:      '#7c3aed',
};

function boardColor(name = ''): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(BOARD_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#6366f1';
}

function boardInitial(name = ''): string {
  return name.charAt(0).toUpperCase() || '?';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface HomeTabProps {
  auth: AuthState;
}

export default function HomeTab({ auth }: HomeTabProps) {
  const [autoApply, setAutoApply] = useState(false);
  const [stats, setStats] = useState<Stats>({ today: 0, queued: 0, month: 0, recent: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsResp, activityResp] = await Promise.all([
          chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }),
          chrome.runtime.sendMessage({ type: 'GET_ACTIVITY_LOG', limit: 200 }),
        ]);

        if (settingsResp?.settings) setAutoApply(settingsResp.settings.autoFill ?? false);

        const activities: ActivityItem[] = activityResp?.activities ?? [];
        const now = new Date();
        const todayStr = now.toDateString();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        setStats({
          today: activities.filter(a => new Date(a.timestamp).toDateString() === todayStr).length,
          queued: activities.filter(a => a.status === 'queued').length,
          month: activities.filter(a => {
            const d = new Date(a.timestamp);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          }).length,
          recent: activities.slice(0, 4),
        });
      } catch (e) {
        console.warn('[ApplyFlow] Home load failed:', e);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const toggleAutoApply = async () => {
    const next = !autoApply;
    setAutoApply(next);
    await chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: { autoFill: next } });
  };

  const quotaPct = Math.min((auth.quota.used / auth.quota.total) * 100, 100);

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!auth.uid) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center', padding: 8 }}>
        <div style={{ fontSize: 40 }}>⚡</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Welcome to ApplyFlow</div>
          <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.5)', lineHeight: 1.5 }}>
            Sign in to start auto-filling job applications and track your progress.
          </div>
        </div>
        <button
          className="btn btn-primary btn-full"
          onClick={() => chrome.tabs.create({ url: `${APP_URL}/login?return=extension` })}
        >
          <Zap size={15} />
          Sign in to ApplyFlow
        </button>
      </div>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Auto-apply hero card */}
      <div className="glass-strong" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.5)', marginBottom: 2 }}>
              Hey {auth.firstName ?? 'there'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Auto-apply</div>
          </div>
          {/* Toggle */}
          <button
            className={`toggle-track${autoApply ? ' on' : ''}`}
            onClick={toggleAutoApply}
            aria-label="Toggle auto-apply"
            style={{ border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <div className="toggle-thumb" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <span
            className={`status-dot${autoApply ? ' green pulse-green' : ' gray'}`}
          />
          <span style={{ fontSize: 12, color: autoApply ? '#34d399' : 'rgba(241,245,249,0.4)', fontWeight: 500 }}>
            {autoApply ? 'Active — filling forms automatically' : 'Paused — click toggle to enable'}
          </span>
        </div>

        {/* Quota bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.45)' }}>Monthly fills</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: quotaPct > 85 ? '#fbbf24' : '#818cf8' }}>
            {auth.quota.used} / {auth.quota.total}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${quotaPct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      {loadingStats ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Today', value: stats.today, color: '#818cf8' },
            { label: 'In queue', value: stats.queued, color: '#fbbf24' },
            { label: 'This month', value: stats.month, color: '#34d399' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="glass"
              style={{ padding: '12px 10px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.1, marginBottom: 4 }}>
                {value}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(241,245,249,0.45)', fontWeight: 500 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent applications */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(241,245,249,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent
          </span>
          <button
            onClick={() => chrome.tabs.create({ url: `${APP_URL}/dashboard/applications` })}
            style={{ fontSize: 11, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            View all →
          </button>
        </div>

        {stats.recent.length === 0 ? (
          <div className="glass" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🎯</div>
            <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.4)' }}>
              No applications yet. Visit a job page to get started.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stats.recent.map((a) => (
              <div
                key={a.id}
                className="glass"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}
              >
                {/* Board icon */}
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: boardColor(a.boardName),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                }}>
                  {boardInitial(a.boardName)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.boardName ?? 'Job board'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.url ?? timeAgo(a.timestamp)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: 'rgba(241,245,249,0.35)' }}>{timeAgo(a.timestamp)}</span>
                  {a.url && (
                    <button
                      onClick={() => chrome.tabs.create({ url: a.url! })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,245,249,0.4)', padding: 0, display: 'flex' }}
                    >
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard link */}
      <button
        className="btn btn-ghost btn-full"
        onClick={() => chrome.tabs.create({ url: `${APP_URL}/dashboard` })}
        style={{ marginTop: 2 }}
      >
        <LayoutDashboard size={14} />
        Open Dashboard
      </button>
    </div>
  );
}
