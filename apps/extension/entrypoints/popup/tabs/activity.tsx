import { useState, useEffect } from 'react';
import { ExternalLink, Inbox } from 'lucide-react';

const APP_URL = import.meta.env.WXT_APP_URL ?? 'https://app.applyflow.io';

interface ActivityItem {
  id: string;
  type?: string;
  url?: string;
  boardName?: string;
  fieldsCount?: number;
  status?: 'filled' | 'submitted' | 'queued' | 'failed';
  timestamp: string;
}

type Filter = 'all' | 'submitted' | 'queued' | 'failed';

const BOARD_COLORS: Record<string, string> = {
  linkedin: '#0077B5', indeed: '#2164f3', greenhouse: '#3cba4d',
  lever: '#1a1a1a', workday: '#005a92', ashby: '#7c3aed',
};

function boardColor(name = ''): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(BOARD_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#6366f1';
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

function statusPill(status: ActivityItem['status']) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted: { label: 'Submitted', cls: 'pill pill-green' },
    filled:    { label: 'Filled',    cls: 'pill pill-blue' },
    queued:    { label: 'Queued',    cls: 'pill pill-yellow' },
    failed:    { label: 'Failed',    cls: 'pill pill-red' },
  };
  const s = map[status ?? 'filled'] ?? map['filled'];
  return <span className={s!.cls}>{s!.label}</span>;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'queued', label: 'Queued' },
  { id: 'failed', label: 'Failed' },
];

export default function ActivityTab() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    chrome.storage.local.get(['activity:log'])
      .then((items) => {
        const log = (items['activity:log'] ?? []) as ActivityItem[];
        setActivities(log.slice(0, 50));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === 'all'
    ? activities
    : activities.filter(a => (a.status ?? 'filled') === filter);

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
    border: active ? '1px solid rgba(129,140,248,0.6)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
    color: active ? '#818cf8' : 'rgba(241,245,249,0.45)',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {FILTERS.map(({ id, label }) => (
          <button key={id} style={filterBtnStyle(filter === id)} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass" style={{ padding: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Inbox size={28} color="rgba(241,245,249,0.25)" />
          <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.4)' }}>
            {filter === 'all' ? 'No activity yet. Visit a job page to start.' : `No ${filter} applications.`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {visible.map((a) => (
            <div key={a.id} className="glass" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {/* Board circle */}
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: boardColor(a.boardName),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
                marginTop: 1,
              }}>
                {(a.boardName ?? 'J').charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.boardName ?? 'Job board'}
                  </span>
                  {statusPill(a.status)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {timeAgo(a.timestamp)}{a.fieldsCount ? ` · ${a.fieldsCount} fields` : ''}
                  </span>
                  {a.url && (
                    <button
                      onClick={() => chrome.tabs.create({ url: a.url! })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,245,249,0.35)', padding: '0 0 0 6px', display: 'flex', flexShrink: 0 }}
                    >
                      <ExternalLink size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            className="btn btn-ghost btn-full btn-sm"
            style={{ marginTop: 4 }}
            onClick={() => chrome.tabs.create({ url: `${APP_URL}/dashboard/applications` })}
          >
            View all in dashboard
          </button>
        </div>
      )}
    </div>
  );
}
