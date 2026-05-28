import { useState, useEffect } from 'react';
import { Button } from '../components/button';
import { FileText, ChevronDown } from 'lucide-react';

interface Resume {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function ResumeTab() {
  const [defaultResume, setDefaultResume] = useState<Resume | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_RESUMES',
        });
        const resumeList = response?.resumes ?? [];
        setResumes(resumeList);
        setDefaultResume(resumeList.find((r: Resume) => r.isDefault) ?? resumeList[0]);
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (!defaultResume) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
        <Button
          className="w-full"
          onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/dashboard/resumes/new' })}
        >
          Create resume
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{defaultResume.name}</p>
            <p className="text-xs text-muted-foreground">Current resume</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          <span>Switch resume</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && resumes.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={async () => {
                  await chrome.runtime.sendMessage({
                    type: 'SET_DEFAULT_RESUME',
                    resumeId: resume.id,
                  });
                  setDefaultResume(resume);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  resume.id === defaultResume.id ? 'bg-muted text-primary font-medium' : ''
                }`}
              >
                {resume.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full justify-start text-sm"
        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/dashboard/resumes' })}
      >
        Manage resumes
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start text-sm"
        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/dashboard/resumes/' + (defaultResume?.id ?? '') + '/edit' })}
      >
        Edit resume
      </Button>
    </div>
  );
}
