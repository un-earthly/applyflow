import { useState } from 'react';
import { Home, Briefcase, Activity, FileText, Settings } from 'lucide-react';
import HomeTab from './tabs/home';
import CurrentJobTab from './tabs/current-job';
import ActivityTab from './tabs/activity';
import ResumeTab from './tabs/resume';
import SettingsTab from './tabs/settings';
import TopBar from './components/topbar';
import BottomNav from './components/bottom-nav';

type TabKey = 'home' | 'current' | 'activity' | 'resume' | 'settings';

const TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'current', label: 'Job', icon: Briefcase },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'resume', label: 'Resume', icon: FileText },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'current':
        return <CurrentJobTab />;
      case 'activity':
        return <ActivityTab />;
      case 'resume':
        return <ResumeTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div
      style={{
        width: '400px',
        height: '640px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <TopBar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {renderTab()}
      </main>
      <BottomNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
