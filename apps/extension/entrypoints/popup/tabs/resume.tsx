import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ExternalLink } from 'lucide-react';

const APP_URL = import.meta.env.WXT_APP_URL ?? 'https://app.applyflow.io';

interface Resume {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function ResumeTab() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [defaultResume, setDefaultResume] = useState<Resume | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['cache:resumes']).then((items) => {
      const list: Resume[] = (items['cache:resumes'] ?? []) as Resume[];
      setResumes(list);
      setDefaultResume(list.find(r => r.isDefault) ?? list[0] ?? null);
    }).finally(() => setLoading(false));

    // Live-update when the background caches resumes after auth
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (!changes['cache:resumes']) return;
      const list: Resume[] = (changes['cache:resumes'].newValue ?? []) as Resume[];
      setResumes(list);
      setDefaultResume(list.find(r => r.isDefault) ?? list[0] ?? null);
    };
    chrome.storage.local.onChanged.addListener(listener);
    return () => chrome.storage.local.onChanged.removeListener(listener);
  }, []);

  const setDefault = async (resume: Resume) => {
    const updated = resumes.map(r => ({ ...r, isDefault: r.id === resume.id }));
    await chrome.storage.local.set({ 'cache:resumes': updated });
    setResumes(updated);
    setDefaultResume(resume);
    setShowDropdown(false);
    chrome.runtime.sendMessage({ type: 'SET_DEFAULT_RESUME', resumeId: resume.id }).catch(() => {});
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!defaultResume) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={22} color="#818cf8" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No resumes yet</div>
          <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)' }}>Create one in the dashboard to get started</div>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 4 }}
          onClick={() => chrome.tabs.create({ url: `${APP_URL}/dashboard/resumes` })}
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Active resume card */}
      <div className="glass" style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(241,245,249,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
          Active Resume
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={16} color="#818cf8" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {defaultResume.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)' }}>Used for autofill</div>
          </div>
        </div>
      </div>

      {/* Resume switcher */}
      {resumes.length > 1 && (
        <div style={{ position: 'relative' }}>
          <button
            className="glass"
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontFamily: 'inherit', color: '#f1f5f9', textAlign: 'left', borderRadius: 12,
            }}
          >
            <span>Switch resume</span>
            <ChevronDown size={14} color="rgba(241,245,249,0.4)"
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
          </button>

          {showDropdown && (
            <div className="glass-strong" style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              borderRadius: 12, overflow: 'hidden', zIndex: 10,
            }}>
              {resumes.map((r, i) => (
                <div key={r.id}>
                  {i > 0 && <div className="divider" />}
                  <button
                    onClick={() => setDefault(r)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 14px',
                      background: r.id === defaultResume.id ? 'rgba(99,102,241,0.12)' : 'none',
                      border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                      color: r.id === defaultResume.id ? '#818cf8' : '#f1f5f9',
                      fontWeight: r.id === defaultResume.id ? 600 : 400,
                    }}
                  >
                    {r.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        {[
          { label: 'Manage resumes', url: `${APP_URL}/dashboard/resumes` },
          { label: 'Edit active resume', url: `${APP_URL}/dashboard/resumes/${defaultResume.id}/edit` },
        ].map(({ label, url }, i) => (
          <div key={label}>
            {i > 0 && <div className="divider" />}
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
      </div>
    </div>
  );
}
