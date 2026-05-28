import { useState, useEffect } from "react";

type Section = "general" | "sites" | "privacy" | "about";

interface SiteRule {
  domain: string;
  autoFill: boolean;
  autoSubmit: boolean;
  blocked: boolean;
}

interface GeneralSettings {
  theme: "light" | "dark" | "system";
  language: string;
  sound: boolean;
  hotkey: string;
}

const DEFAULT_GENERAL: GeneralSettings = {
  theme: "system",
  language: "en",
  sound: true,
  hotkey: "ctrl+shift+f",
};

const WEB_URL = import.meta.env.WXT_WEB_URL ?? "https://app.applyflow.app";

function GeneralSection(): React.ReactElement {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_GENERAL);

  useEffect(() => {
    browser.storage.sync.get(["generalSettings"]).then((d) => {
      if (d.generalSettings) setSettings({ ...DEFAULT_GENERAL, ...d.generalSettings as Partial<GeneralSettings> });
    });
  }, []);

  const save = async (next: GeneralSettings) => {
    setSettings(next);
    await browser.storage.sync.set({ generalSettings: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => void save({ ...settings, theme: e.target.value as GeneralSettings["theme"] })}
          className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="system">System default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Language</label>
        <select
          value={settings.language}
          onChange={(e) => void save({ ...settings, language: e.target.value })}
          className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => void save({ ...settings, sound: e.target.checked })}
            className="rounded"
          />
          <div>
            <p className="text-sm font-medium">Sound on fill</p>
            <p className="text-xs text-gray-500">Play a sound when fields are filled</p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Autofill hotkey</label>
        <input
          type="text"
          value={settings.hotkey}
          onChange={(e) => void save({ ...settings, hotkey: e.target.value })}
          className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">Use format: ctrl+shift+key or cmd+shift+key</p>
      </div>
    </div>
  );
}

function SitesSection(): React.ReactElement {
  const [rules, setRules] = useState<SiteRule[]>([]);

  useEffect(() => {
    browser.storage.local.get(["siteRules"]).then((d) => {
      if (d.siteRules) setRules(d.siteRules as SiteRule[]);
    });
  }, []);

  const updateRule = async (domain: string, field: keyof Omit<SiteRule, "domain">, value: boolean) => {
    const updated = rules.map((r) => r.domain === domain ? { ...r, [field]: value } : r);
    setRules(updated);
    await browser.storage.local.set({ siteRules: updated });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Per-domain autofill rules. Changes apply immediately.</p>

      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed rounded-xl">
          No site rules yet. Rules are created automatically when you use ApplyFlow on a job page.
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Domain</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Auto-fill</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Auto-submit</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Blocked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((rule) => (
                <tr key={rule.domain} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{rule.domain}</td>
                  {(["autoFill", "autoSubmit", "blocked"] as const).map((field) => (
                    <td key={field} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={rule[field]}
                        onChange={(e) => void updateRule(rule.domain, field, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PrivacySection(): React.ReactElement {
  const [paused, setPaused] = useState(false);
  const [pauseUntil, setPauseUntil] = useState<number | null>(null);

  useEffect(() => {
    browser.storage.local.get(["pauseUntil"]).then((d) => {
      const until = d.pauseUntil as number | undefined;
      if (until && until > Date.now()) {
        setPaused(true);
        setPauseUntil(until);
      }
    });
  }, []);

  const pause1h = async () => {
    const until = Date.now() + 3600_000;
    setPaused(true);
    setPauseUntil(until);
    await browser.storage.local.set({ pauseUntil: until });
  };

  const resume = async () => {
    setPaused(false);
    setPauseUntil(null);
    await browser.storage.local.remove(["pauseUntil"]);
  };

  const clearCache = async () => {
    await browser.storage.local.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Pause schedule</h3>
        {paused && pauseUntil ? (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-sm">Paused until {new Date(pauseUntil).toLocaleTimeString()}</span>
            <button onClick={() => void resume()} className="ml-auto text-sm text-amber-700 hover:underline">
              Resume now
            </button>
          </div>
        ) : (
          <button
            onClick={() => void pause1h()}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Pause for 1 hour
          </button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-1">Clear local cache</h3>
        <p className="text-xs text-gray-500 mb-3">
          Removes all locally stored data including resume cache, board configs, and session info.
          You will need to sign in again.
        </p>
        <button
          onClick={() => void clearCache()}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
        >
          Clear all data
        </button>
      </div>
    </div>
  );
}

function AboutSection(): React.ReactElement {
  const [version, setVersion] = useState("");

  useEffect(() => {
    setVersion(browser.runtime.getManifest().version);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">ApplyFlow Extension</h3>
        <p className="text-sm text-gray-500">Version {version}</p>
      </div>

      <div className="space-y-2">
        {[
          { label: "Documentation", url: `${WEB_URL}/docs` },
          { label: "Contact support", url: `${WEB_URL}/contact` },
          { label: "Privacy policy", url: `${WEB_URL}/legal/privacy` },
          { label: "Terms of service", url: `${WEB_URL}/legal/terms` },
        ].map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            {link.label} ↗
          </a>
        ))}
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} ApplyFlow. Licensed under MIT.
        </p>
      </div>
    </div>
  );
}

const SECTIONS: { id: Section; label: string }[] = [
  { id: "general", label: "General" },
  { id: "sites", label: "Sites" },
  { id: "privacy", label: "Privacy" },
  { id: "about", label: "About" },
];

export default function OptionsApp(): React.ReactElement {
  const [section, setSection] = useState<Section>("general");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <nav className="w-56 bg-white border-r min-h-screen p-4">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-blue-600 font-bold text-lg">⚡</span>
          <span className="font-semibold">ApplyFlow</span>
        </div>
        <ul className="space-y-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  section === s.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-6">
          {SECTIONS.find((s) => s.id === section)?.label}
        </h1>
        {section === "general" && <GeneralSection />}
        {section === "sites" && <SitesSection />}
        {section === "privacy" && <PrivacySection />}
        {section === "about" && <AboutSection />}
      </main>
    </div>
  );
}
