import { useState, useEffect } from 'react';
import { Button } from '../components/button';
import { ChevronRight } from 'lucide-react';

interface Settings {
  autoFill: boolean;
  autoSubmit: boolean;
  showOverlay: boolean;
  soundEnabled: boolean;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings>({
    autoFill: false,
    autoSubmit: false,
    showOverlay: true,
    soundEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; displayName?: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsResp, authResp] = await Promise.all([
          chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }),
          chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }),
        ]);

        if (settingsResp?.settings) {
          setSettings(settingsResp.settings);
        }
        if (authResp?.user) {
          setUser(authResp.user);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { [key]: value },
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {user && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="font-medium text-sm">{user.displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase">Behavior</div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoFill}
            onChange={(e) => updateSetting('autoFill', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Auto-fill form</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoSubmit}
            onChange={(e) => updateSetting('autoSubmit', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Auto-submit</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showOverlay}
            onChange={(e) => updateSetting('showOverlay', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show detection toast</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Sound on fill</span>
        </label>
      </div>

      <div className="space-y-2 text-sm">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id })}
        >
          <span>Extension settings</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => {
            window.open('http://localhost:3000/dashboard/settings');
            window.close();
          }}
        >
          <span>Account settings</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2">
        <p>ApplyFlow v1.0.0</p>
        <p>Made with ❤️ for job seekers</p>
      </div>
    </div>
  );
}
