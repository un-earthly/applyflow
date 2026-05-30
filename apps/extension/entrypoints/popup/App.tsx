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

    const applyStatus = (status: { isLoggedIn?: boolean; user?: { uid?: string; email?: string; displayName?: string; fullName?: string }; quota?: { used: number; total: number } } | null) => {
      if (cancelled) return;
      const profile = status?.user;
      const displayName = profile?.displayName ?? profile?.fullName ?? null;
      setAuth({
        uid: status?.isLoggedIn ? (profile?.uid ?? null) : null,
        email: profile?.email ?? null,
        displayName,
        firstName: displayName?.split(' ')[0] ?? null,
        quota: status?.quota ?? { used: 0, total: 50 },
        loading: false,
      });
    };

    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T | null> =>
      Promise.race([
        promise.catch(() => null),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
      ]);

    const load = async () => {
      // 3 s timeout — the popup must never hang waiting for the background SW.
      const status = await withTimeout(
        chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }),
        3000,
      );
      applyStatus(status as Parameters<typeof applyStatus>[0]);

      // If the background returned nothing (SW was cold-starting / syncing cookie),
      // retry once after 1.5 s to pick up the freshly stored token.
      if (!status || !(status as { isLoggedIn?: boolean }).isLoggedIn) {
        await new Promise((r) => setTimeout(r, 1500));
        const retry = await withTimeout(
          chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }),
          3000,
        );
        applyStatus(retry as Parameters<typeof applyStatus>[0]);
      }
    };

    void load();
    return () => { cancelled = true; };
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
