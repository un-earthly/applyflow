import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Scan, Zap, Eye } from 'lucide-react';

interface DetectedField {
  label: string;
  value: string;
  confidence: number;
}

type DetectionStatus = 'loading' | 'detected' | 'unsupported' | 'empty';

interface Detection {
  status: DetectionStatus;
  board?: string;
  fields?: DetectedField[];
  message?: string;
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return '#34d399';
  if (c >= 0.5) return '#fbbf24';
  return '#f87171';
}

export default function CurrentJobTab() {
  const [detection, setDetection] = useState<Detection>({ status: 'loading' });

  useEffect(() => {
    const detect = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) { setDetection({ status: 'empty', message: 'No active tab.' }); return; }

        const response = await chrome.tabs.sendMessage(tab.id, { type: 'DETECT_FORM' }).catch(() => null);

        if (!response) {
          setDetection({ status: 'empty', message: 'No job form detected on this page.' });
          return;
        }
        if (response.status === 'detected') {
          setDetection({ status: 'detected', board: response.boardName ?? response.board, fields: response.fields ?? [] });
        } else if (response.status === 'unsupported') {
          setDetection({ status: 'unsupported', message: 'This job board is not yet supported.' });
        } else {
          setDetection({ status: 'empty', message: 'No job application form found on this page.' });
        }
      } catch {
        setDetection({ status: 'empty', message: 'Could not connect to the page.' });
      }
    };
    detect();
  }, []);

  const doFill = async (showPanel = false) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.tabs.sendMessage(tab.id, { type: showPanel ? 'SHOW_REVIEW_PANEL' : 'FILL_FORM' });
    window.close();
  };

  const S: Record<string, React.CSSProperties> = {
    center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, gap: 14, textAlign: 'center' },
    boardBadge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 20,
      background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
      color: '#34d399', fontSize: 12, fontWeight: 600, marginBottom: 14,
    },
    fieldRow: {
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    },
    actionRow: { display: 'flex', gap: 8, marginTop: 4 },
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (detection.status === 'loading') {
    return (
      <div style={S.center}>
        <div className="spinner" />
        <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.4)' }}>Scanning page…</span>
      </div>
    );
  }

  // ── Empty / unsupported ──────────────────────────────────────────────────
  if (detection.status === 'empty' || detection.status === 'unsupported') {
    return (
      <div style={S.center}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {detection.status === 'unsupported'
            ? <AlertCircle size={24} color="#fbbf24" />
            : <Scan size={24} color="rgba(241,245,249,0.3)" />}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            {detection.status === 'unsupported' ? 'Unsupported site' : 'No form detected'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)', lineHeight: 1.5 }}>
            {detection.message}
          </div>
        </div>
        {detection.status === 'unsupported' && (
          <button className="btn btn-ghost btn-sm">
            <AlertCircle size={13} />
            Report this site
          </button>
        )}
        <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.25)', marginTop: 4 }}>
          Supported: LinkedIn · Indeed · Greenhouse · Lever · Workday
        </div>
      </div>
    );
  }

  // ── Detected ─────────────────────────────────────────────────────────────
  const fields = detection.fields ?? [];
  const avgConf = fields.length ? fields.reduce((s, f) => s + f.confidence, 0) / fields.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Board header */}
      <div className="glass-strong" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #34d399, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(52,211,153,0.3)',
          }}>
            <CheckCircle2 size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Form detected!</div>
            <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.5)', marginTop: 1 }}>
              {detection.board ?? 'Job board'} · {fields.length} field{fields.length !== 1 ? 's' : ''} found
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: confidenceColor(avgConf) }}>
              {Math.round(avgConf * 100)}%
            </div>
            <div style={{ fontSize: 10, color: 'rgba(241,245,249,0.35)' }}>confidence</div>
          </div>
        </div>
      </div>

      {/* Field list */}
      {fields.length > 0 && (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {fields.map((field, idx) => (
              <div key={idx}>
                {idx > 0 && <div className="divider" />}
                <div style={S.fieldRow}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: confidenceColor(field.confidence),
                    boxShadow: `0 0 6px ${confidenceColor(field.confidence)}`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.45)', marginBottom: 1 }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {field.value || <span style={{ color: 'rgba(241,245,249,0.25)', fontStyle: 'italic' }}>No value mapped</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={S.actionRow}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => doFill(true)}>
          <Eye size={14} />
          Review
        </button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => doFill(false)}>
          <Zap size={14} />
          Fill form
        </button>
      </div>
    </div>
  );
}
