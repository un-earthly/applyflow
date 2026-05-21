import { useState, useEffect } from "react";
import { ExternalLink, LogOut, Volume2, Eye, Zap, Shield } from "lucide-react";

interface Profile {
  displayName?: string;
  email?: string;
}

interface ExtSettings {
  autoFill: boolean;
  autoSubmit: boolean;
  showOverlay: boolean;
  sound: boolean;
}

const DEFAULT_SETTINGS: ExtSettings = {
  autoFill: false,
  autoSubmit: false,
  showOverlay: true,
  sound: true,
};

export function SettingsTab(): React.ReactElement {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<ExtSettings>(DEFAULT_SETTINGS);
  const [version, setVersion] = useState("");

  useEffect(() => {
    browser.storage.local.get(["userProfile", "extSettings"]).then((result) => {
      setProfile((result.userProfile as Profile | undefined) ?? null);
      setSettings({ ...DEFAULT_SETTINGS, ...((result.extSettings as Partial<ExtSettings>) ?? {}) });
    });
    const manifest = browser.runtime.getManifest();
    setVersion(manifest.version);
  }, []);

  const toggleSetting = async (key: keyof ExtSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await browser.storage.local.set({ extSettings: updated });
  };

  const handleSignOut = async () => {
    await browser.runtime.sendMessage({ type: "SIGN_OUT" });
    await browser.storage.local.remove(["userProfile", "sessionToken"]);
    setProfile(null);
  };

  const WEB_URL = import.meta.env.VITE_WEB_URL ?? "https://app.applyflow.io";

  const BEHAVIOR_SETTINGS = [
    { key: "autoFill" as const, label: "Auto-fill on detect", icon: Zap },
    { key: "autoSubmit" as const, label: "Auto-submit (if board allows)", icon: Zap },
    { key: "showOverlay" as const, label: "Show overlay", icon: Eye },
    { key: "sound" as const, label: "Sound on fill", icon: Volume2 },
  ];

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      {/* Account */}
      {profile ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</p>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {profile.displayName?.[0]?.toUpperCase() ?? profile.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{profile.displayName ?? "—"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
            <button onClick={() => void handleSignOut()}>
              <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-3 text-sm text-muted-foreground text-center">
          Not signed in.{" "}
          <button
            onClick={() => browser.tabs.create({ url: `${WEB_URL}/login?return=extension` })}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Behavior */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Behavior</p>
        <div className="rounded-lg border divide-y">
          {BEHAVIOR_SETTINGS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm">{label}</span>
              <button
                onClick={() => void toggleSetting(key)}
                className={`relative h-5 w-9 rounded-full transition-colors ${settings[key] ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings[key] ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Privacy</p>
        <div className="rounded-lg border">
          <button
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-muted/50"
            onClick={() => browser.storage.local.clear()}
          >
            <Shield className="h-4 w-4 text-muted-foreground" />
            Clear local cache
          </button>
        </div>
      </div>

      {/* Help */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Help</p>
        <button
          onClick={() => browser.tabs.create({ url: `${WEB_URL}/contact` })}
          className="flex items-center gap-2 w-full px-0 py-1.5 text-sm text-muted-foreground hover:text-foreground text-left"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Contact support
        </button>
        <p className="text-xs text-muted-foreground">Version {version}</p>
      </div>
    </div>
  );
}
