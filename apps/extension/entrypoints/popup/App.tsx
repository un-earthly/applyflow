import { useState, useEffect } from 'react';
import { Home, Briefcase, Clock, Settings } from 'lucide-react';
import HomeTab from './tabs/home';
import CurrentJobTab from './tabs/current-job';
import ActivityTab from './tabs/activity';
import SettingsTab from './tabs/settings';

type Tab = 'home' | 'current' | 'activity' | 'settings';

export interface AuthState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  quota: { used: number; total: number };
  loading: boolean;
}

const APP_URL = import.meta.env.WXT_APP_URL ?? 'https://app.applyflow.io';

const TABS: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home',     icon: Home,      label: 'Home' },
  { id: 'current',  icon: Briefcase, label: 'Apply' },
  { id: 'activity', icon: Clock,     label: 'Activity' },
  { id: 'settings', icon: Settings,  label: 'Settings' },
];

// Auth is always delegated to the background service worker.
// The background handles chrome.cookies + chrome.storage — popups should
// never call those APIs directly, as they can hang before the SW is ready.

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [auth, setAuth] = useState<AuthState>({
    uid: null, email: null, displayName: null, firstName: null,
    quota: { used: 0, total: 50 }, loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    let storageListener: ((changes: Record<string, chrome.storage.StorageChange>, area: string) => void) | null = null;

    const applyItems = (items: Record<string, unknown>) => {
      if (cancelled) return;
      const token = items['session:token'] as string | undefined;
      const profile = items['auth:user'] as { uid?: string; email?: string; displayName?: string; fullName?: string } | undefined;
      const displayName = profile?.displayName ?? profile?.fullName ?? null;
      setAuth({
        uid: token ? (profile?.uid ?? null) : null,
        email: profile?.email ?? null,
        displayName,
        firstName: displayName?.split(' ')[0] ?? null,
        quota: (items['quota:usage'] as { used: number; total: number }) ?? { used: 0, total: 50 },
        loading: false,
      });
    };

    // Read chrome.storage.local directly — always fast, no service worker needed.
    // This means loading always resolves quickly even if the SW is cold-starting.
    chrome.storage.local.get(['auth:user', 'session:token', 'quota:usage'])
      .then((items) => {
        applyItems(items);

        if (!items['session:token']) {
          // Not logged in yet. Subscribe to storage changes so we auto-update
          // the moment the background finishes the cookie sync — no polling needed.
          storageListener = (changes, area) => {
            if (area !== 'local' || !('session:token' in changes)) return;
            chrome.storage.local.get(['auth:user', 'session:token', 'quota:usage']).then(applyItems);
          };
          chrome.storage.onChanged.addListener(storageListener);

          // Wake the service worker so it runs syncAuthFromCookie().
          // Ignore errors — the onChanged listener is the real signal.
          chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }).catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setAuth((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      cancelled = true;
      if (storageListener) chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 3, background: 'none', border: 'none',
    cursor: 'pointer', color: active ? '#818cf8' : 'rgba(241,245,249,0.35)',
    fontSize: 10, fontWeight: active ? 600 : 400, transition: 'color 180ms ease',
    padding: '6px 0', fontFamily: 'inherit', position: 'relative',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 380, height: 600, background: 'linear-gradient(145deg, #0b0f1e 0%, #16133a 100%)', color: '#f1f5f9', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>⚡</div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}>ApplyFlow</span>
        </div>
        {auth.uid && (
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(241,245,249,0.45)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)' }}>
            {auth.firstName ?? auth.email?.split('@')[0] ?? 'User'}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {auth.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="spinner" />
          </div>
        ) : activeTab === 'home' ? (
          <HomeTab auth={auth} />
        ) : activeTab === 'current' ? (
          <CurrentJobTab />
        ) : activeTab === 'activity' ? (
          <ActivityTab />
        ) : (
          <SettingsTab auth={auth} onSignOut={() => setAuth({ uid: null, email: null, displayName: null, firstName: null, quota: { used: 0, total: 50 }, loading: false })} />
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)', flexShrink: 0, height: 58 }}>
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button key={id} style={tabStyle(active)} onClick={() => setActiveTab(id)}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
              {active && <span style={{ position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 6px #818cf8' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
