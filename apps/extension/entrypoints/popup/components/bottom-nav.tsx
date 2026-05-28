import { LucideIcon } from 'lucide-react';

type TabKey = 'home' | 'current' | 'activity' | 'resume' | 'settings';

interface BottomNavProps {
  tabs: readonly { key: TabKey; label: string; icon: LucideIcon }[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function BottomNav({ tabs, activeTab, onTabChange }: BottomNavProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: '64px',
        alignItems: 'stretch',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--background)',
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            color: activeTab === key ? 'var(--primary)' : 'var(--muted-foreground)',
            transition: 'all 150ms ease-in-out',
            borderBottom: activeTab === key ? '3px solid var(--primary)' : '3px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== key) {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== key) {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
            }
          }}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
