import { useState, useEffect } from 'react';
import HomeTab from './tabs/home';
import CurrentJobTab from './tabs/current-job';
import ActivityTab from './tabs/activity';
import ResumeTab from './tabs/resume';
import SettingsTab from './tabs/settings';

type Tab = "home" | "current-job" | "activity" | "resume" | "settings";

export interface AuthState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  loading: boolean;
}

const TAB_CONFIG: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "current-job", icon: "💼", label: "Current" },
  { id: "activity", icon: "📋", label: "Activity" },
  { id: "resume", icon: "📄", label: "Resume" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [auth, setAuth] = useState<AuthState>({ uid: null, email: null, displayName: null, loading: true });

  useEffect(() => {
    browser.storage.local.get(["auth:user", "session:token"]).then((data) => {
      const profile = data["auth:user"] as { uid?: string; email?: string; displayName?: string; fullName?: string } | undefined;
      const hasToken = !!data["session:token"];
      setAuth({
        uid: hasToken ? (profile?.uid ?? null) : null,
        email: profile?.email ?? null,
        displayName: profile?.displayName ?? profile?.fullName ?? null,
        loading: false,
      });
    });
  }, []);

  const currentLabel = TAB_CONFIG.find((t) => t.id === activeTab)?.label ?? "";

  return (
    <div className="flex flex-col bg-white" style={{ width: 380, height: 600 }}>
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-blue-600 font-bold">⚡</span>
          <span className="font-semibold text-sm">ApplyFlow</span>
        </div>
        <span className="text-sm font-medium text-gray-600">{currentLabel}</span>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {auth.loading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">Loading…</div>
        ) : activeTab === "home" ? (
          <HomeTab auth={auth} />
        ) : activeTab === "current-job" ? (
          <CurrentJobTab />
        ) : activeTab === "activity" ? (
          <ActivityTab />
        ) : activeTab === "resume" ? (
          <ResumeTab />
        ) : (
          <SettingsTab auth={auth} />
        )}
      </div>

      <div className="flex border-t border-gray-100 shrink-0 h-14">
        {TAB_CONFIG.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
