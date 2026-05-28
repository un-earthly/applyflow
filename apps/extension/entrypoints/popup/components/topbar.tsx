import { LogOut } from 'lucide-react';

export default function TopBar() {
  return (
    <div
      style={{
        display: 'flex',
        height: '56px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--background)',
        paddingLeft: '16px',
        paddingRight: '16px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            borderRadius: 'calc(var(--radius) * 1.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '16px',
          }}
        >
          A
        </div>
        <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--foreground)' }}>ApplyFlow</div>
      </div>
      <button
        onClick={async () => {
          await chrome.runtime.sendMessage({ type: 'LOGOUT' });
          window.close();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '8px',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          color: 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 150ms ease-in-out',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
