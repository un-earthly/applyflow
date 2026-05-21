import { useState, useEffect } from "react";
import "./App.css";

type Tab = "home" | "current-job" | "activity" | "resume" | "settings";

const WEB_URL = import.meta.env.WXT_WEB_URL ?? "https://app.applyflow.app";

interface AuthState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  loading: boolean;
}

function HomeTab({ auth }: { auth: AuthState }) {
  if (!auth.uid) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="text-4xl font-bold text-blue-600">⚡</div>
        <div>
          <h2 className="text-lg font-semibold">Sign in to ApplyFlow</h2>
          <p className="text-sm text-gray-500 mt-1">Autofill job applications in seconds</p>
        </div>
        <button
          onClick={() => browser.tabs.create({ url: `${WEB_URL}/login?return=extension` })}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  const firstName = auth.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold">Hey, {firstName} 👋</h2>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Autofills this month</span>
            <span>10 / 50</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Quick actions</p>
        {[
          { label: "View applications", url: "/dashboard/applications" },
          { label: "Browse recommended jobs", url: "/dashboard/jobs" },
          { label: "Open resume editor", url: "/dashboard/resume" },
        ].map((action) => (
          <button
            key={action.url}
            onClick={() => browser.tabs.create({ url: `${WEB_URL}${action.url}` })}
            className="w-full text-left text-sm py-2.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <span>{action.label}</span>
            <span className="text-gray-400">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CurrentJobTab() {
  const [status, setStatus] = useState<"detecting" | "detected" | "unsupported" | "no-form">("detecting");

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab?.id) { setStatus("no-form"); return; }
      browser.tabs.sendMessage(tab.id, { type: "GET_DETECTION_STATUS" })
        .then((res: { status: string }) => setStatus(res.status as typeof status))
        .catch(() => setStatus("no-form"));
    });
  }, []);

  if (status === "detecting") {
    return <div className="flex items-center justify-center h-full text-sm text-gray-400">Detecting…</div>;
  }

  if (status === "no-form" || status === "unsupported") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
        <div className="text-4xl">👀</div>
        <p className="text-sm text-gray-500">No application form detected on this page.</p>
        <p className="text-xs text-gray-400">Open a job posting on a supported board to use ApplyFlow.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-green-700">Form detected</span>
      </div>
      <div className="space-y-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Detected fields</p>
        {["Full name", "Email", "Phone", "Resume upload"].map((field) => (
          <div key={field} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-sm">{field}</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">Ready</span>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors">
        Fill form
      </button>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recent fills</p>
      <div className="text-center py-12 text-gray-400 text-sm">No recent activity</div>
    </div>
  );
}

function ResumeTab() {
  return (
    <div className="p-4 space-y-4">
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="text-xs text-gray-400 mb-1">Active resume</p>
        <p className="text-sm font-medium">My Resume</p>
      </div>
      <button
        onClick={() => browser.tabs.create({ url: `${WEB_URL}/dashboard/resume` })}
        className="w-full text-sm py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Open editor →
      </button>
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Quick cover letter</p>
        <textarea
          placeholder="Paste job description…"
          className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <button className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          Generate cover letter
        </button>
      </div>
    </div>
  );
}

function SettingsTab({ auth }: { auth: AuthState }) {
  const signOut = async () => {
    await browser.storage.local.remove(["authToken", "userProfile"]);
    browser.tabs.create({ url: `${WEB_URL}/login` });
    window.close();
  };

  return (
    <div className="p-4 space-y-4">
      {auth.uid && (
        <div className="rounded-lg border border-gray-200 p-3 space-y-0.5">
          <p className="text-sm font-medium">{auth.displayName ?? "User"}</p>
          <p className="text-xs text-gray-500">{auth.email}</p>
        </div>
      )}

      <div className="space-y-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Behavior</p>
        {[
          { label: "Show autofill overlay", defaultOn: true },
          { label: "Auto-fill on detect", defaultOn: false },
          { label: "Sound on fill", defaultOn: false },
        ].map((setting) => (
          <label key={setting.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 cursor-pointer">
            <span className="text-sm">{setting.label}</span>
            <input type="checkbox" defaultChecked={setting.defaultOn} className="rounded" />
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => browser.tabs.create({ url: `${WEB_URL}/dashboard/settings` })}
          className="w-full text-sm py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Open full settings →
        </button>
        {auth.uid && (
          <button
            onClick={() => void signOut()}
            className="w-full text-sm py-2 px-3 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        )}
      </div>

      <div className="text-center text-xs text-gray-300">ApplyFlow Extension v1.0.0</div>
    </div>
  );
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
    browser.storage.local.get(["userProfile"]).then((data) => {
      const profile = data.userProfile as { uid?: string; email?: string; displayName?: string } | undefined;
      setAuth({
        uid: profile?.uid ?? null,
        email: profile?.email ?? null,
        displayName: profile?.displayName ?? null,
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
