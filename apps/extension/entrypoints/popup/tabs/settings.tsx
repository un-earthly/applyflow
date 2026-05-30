import { useState, useEffect } from 'react';
import { LogOut, ExternalLink, FileText, ChevronDown } from 'lucide-react';
import type { AuthState } from '../App';

const APP_URL = import.meta.env.WXT_APP_URL ?? 'https://app.applyflow.io';

interface Settings {
  autoFill: boolean;
  autoSubmit: boolean;
  showOverlay: boolean;
  soundEnabled: boolean;
}

interface Resume {
  id: string;
  name: string;
  isDefault: boolean;
}

interface SettingsTabProps {
  auth: AuthState;
  onSignOut: () => void;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`toggle-track${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
      style={{ border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
      aria-label="toggle"
    >
      <div className="toggle-thumb" />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(241,245,249,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
        {title}
      </div>
      <div className="glass" style={{ overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, desc, on, onChange }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)', marginTop: 1 }}>{desc}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

export default function SettingsTab({ auth, onSignOut }: SettingsTabProps) {
  const [settings, setSettings] = useState<Settings>({ autoFill: false, autoSubmit: false, showOverlay: true, soundEnabled: true });
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [defaultResume, setDefaultResume] = useState<Resume | null>(null);
  const [showResumeList, setShowResumeList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read settings and resumes directly from storage — no SW round-trip needed.
    chrome.storage.local.get(['settings:preferences', 'cache:resumes'])
      .then((items) => {
        const prefs = items['settings:preferences'] as Partial<Settings> | undefined;
        if (prefs) setSettings(s => ({ ...s, ...prefs }));

        const list: Resume[] = (items['cache:resumes'] ?? []) as Resume[];
        setResumes(list);
        setDefaultResume(list.find(r => r.isDefault) ?? list[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    // Write directly to storage — source of truth — then also notify the SW
    await chrome.storage.local.set({ 'settings:preferences': next });
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: { [key]: value } }).catch(() => {});
  };

  const handleSignOut = async () => {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    onSignOut();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Account */}
      {auth.uid ? (
        <Section title="Account">
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}>
              {(auth.displayName ?? auth.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {auth.displayName ?? auth.email ?? 'User'}
              </div>
              {auth.email && auth.displayName && (
                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {auth.email}
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(248,113,113,0.7)', padding: 4, display: 'flex', borderRadius: 6, flexShrink: 0 }}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </Section>
      ) : (
        <button
          className="btn btn-primary btn-full"
          onClick={() => chrome.tabs.create({ url: `${APP_URL}/login?return=extension` })}
        >
          Sign in to ApplyFlow
        </button>
      )}

      {/* Behavior */}
      <Section title="Behavior">
        <SettingRow label="Auto-fill" desc="Fill detected forms automatically" on={settings.autoFill} onChange={v => updateSetting('autoFill', v)} />
        <div className="divider" />
        <SettingRow label="Auto-submit" desc="Submit forms after filling (LinkedIn)" on={settings.autoSubmit} onChange={v => updateSetting('autoSubmit', v)} />
        <div className="divider" />
        <SettingRow label="Show toast" desc="Overlay when a form is detected" on={settings.showOverlay} onChange={v => updateSetting('showOverlay', v)} />
        <div className="divider" />
        <SettingRow label="Sound" on={settings.soundEnabled} onChange={v => updateSetting('soundEnabled', v)} />
      </Section>

      {/* Resume */}
      {defaultResume && (
        <Section title="Active Resume">
          <div style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={15} color="#818cf8" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {defaultResume.name}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)' }}>Active resume</div>
              </div>
              {resumes.length > 1 && (
                <button
                  onClick={() => setShowResumeList(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,245,249,0.4)', padding: 2, display: 'flex', flexShrink: 0 }}
                >
                  <ChevronDown size={15} style={{ transform: showResumeList ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                </button>
              )}
            </div>

            {showResumeList && resumes.length > 1 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={async () => {
                      await chrome.runtime.sendMessage({ type: 'SET_DEFAULT_RESUME', resumeId: r.id });
                      setDefaultResume(r);
                      setShowResumeList(false);
                    }}
                    style={{
                      background: r.id === defaultResume.id ? 'rgba(99,102,241,0.12)' : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 8px',
                      borderRadius: 7, fontSize: 13, fontFamily: 'inherit',
                      color: r.id === defaultResume.id ? '#818cf8' : '#f1f5f9',
                      fontWeight: r.id === defaultResume.id ? 600 : 400,
                      transition: 'background 150ms',
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Links */}
      <Section title="Links">
        {[
          { label: 'Dashboard', url: `${APP_URL}/dashboard` },
          { label: 'Account settings', url: `${APP_URL}/settings/account` },
          { label: 'Billing', url: `${APP_URL}/settings/billing` },
        ].map(({ label, url }, idx, arr) => (
          <div key={label}>
            {idx > 0 && <div className="divider" />}
            <button
              onClick={() => { chrome.tabs.create({ url }); window.close(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontFamily: 'inherit', color: '#f1f5f9', textAlign: 'left',
              }}
            >
              <span>{label}</span>
              <ExternalLink size={12} color="rgba(241,245,249,0.3)" />
            </button>
          </div>
        ))}
      </Section>

      <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(241,245,249,0.2)', paddingBottom: 4 }}>
        ApplyFlow v1.0.0
      </div>
    </div>
  );
}
