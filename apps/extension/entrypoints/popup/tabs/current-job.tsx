import { useState, useEffect } from 'react';
import { Button } from '../components/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function CurrentJobTab() {
  const [detection, setDetection] = useState<{
    status: 'loading' | 'detected' | 'partial' | 'unsupported' | 'empty';
    board?: string;
    fields?: Array<{ label: string; value: string; confidence: number }>;
    message?: string;
  }>({ status: 'empty' });

  useEffect(() => {
    const detectForm = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) return;

        setDetection({ status: 'loading' });

        const response = await chrome.tabs.sendMessage(tab.id, {
          type: 'DETECT_FORM',
        }).catch(() => null);

        if (!response) {
          setDetection({ status: 'empty', message: 'No job form detected on this page.' });
          return;
        }

        if (response.status === 'detected') {
          setDetection({
            status: 'detected',
            board: response.board,
            fields: response.fields,
          });
        } else if (response.status === 'unsupported') {
          setDetection({
            status: 'unsupported',
            message: 'This job board is not yet supported.',
          });
        } else {
          setDetection({ status: 'empty', message: 'No form on this page.' });
        }
      } catch (error) {
        console.error('Detection error:', error);
        setDetection({ status: 'empty', message: 'Error detecting form.' });
      }
    };

    detectForm();
  }, []);

  if (detection.status === 'loading') {
    return <div className="flex items-center justify-center py-12">Detecting form...</div>;
  }

  if (detection.status === 'empty' || detection.status === 'unsupported') {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">{detection.message}</p>
        {detection.status === 'unsupported' && (
          <Button variant="outline" size="sm" className="w-full">
            Report this site
          </Button>
        )}
      </div>
    );
  }

  if (detection.status === 'detected' && detection.fields) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Form detected</p>
            <p className="text-xs text-muted-foreground">{detection.board}</p>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {detection.fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
              <div className="flex-1">
                <p className="font-medium text-xs">{field.label}</p>
                <p className="text-xs text-muted-foreground truncate">{field.value}</p>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${
                  field.confidence > 0.8
                    ? 'bg-primary'
                    : field.confidence > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-destructive'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={async () => {
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (tab.id) {
                await chrome.tabs.sendMessage(tab.id, { type: "FILL_FORM" });
                window.close();
              }
            }}
          >
            Fill form
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            onClick={async () => {
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (tab.id) {
                await chrome.tabs.sendMessage(tab.id, { type: "SHOW_REVIEW_PANEL" });
                window.close();
              }
            }}
          >
            Review
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
