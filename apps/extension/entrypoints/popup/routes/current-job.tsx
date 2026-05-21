import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, XCircle, Circle, Edit2 } from "lucide-react";

interface FieldMap {
  fieldLabel: string;
  value: string;
  confidence: number;
}

type DetectionStatus = "detected" | "partial" | "unsupported" | "none";

interface Detection {
  status: DetectionStatus;
  board?: string;
  reason?: string;
  fields?: FieldMap[];
}

function ConfidenceDot({ score }: { score: number }): React.ReactElement {
  const color = score >= 0.8 ? "text-green-500" : score >= 0.5 ? "text-amber-500" : "text-red-500";
  return <span className={`h-2 w-2 rounded-full inline-block ${color.replace("text", "bg")}`} />;
}

export function CurrentJobTab(): React.ReactElement {
  const [detection, setDetection] = useState<Detection | null>(null);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab?.id) {
        setDetection({ status: "none" });
        return;
      }
      browser.tabs.sendMessage(tab.id, { type: "GET_DETECTION" })
        .then((resp: Detection) => setDetection(resp))
        .catch(() => setDetection({ status: "none" }));
    });
  }, []);

  const handleFill = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    setFilling(true);
    try {
      await browser.tabs.sendMessage(tab.id, { type: "FILL_FORM" });
    } finally {
      setFilling(false);
    }
  };

  if (!detection) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const STATUS_INFO = {
    detected: { icon: CheckCircle2, color: "text-green-500", label: "Form detected" },
    partial: { icon: AlertCircle, color: "text-amber-500", label: "Partial detection" },
    unsupported: { icon: XCircle, color: "text-red-500", label: "Unsupported page" },
    none: { icon: Circle, color: "text-muted-foreground", label: "No form on this page" },
  };

  const info = STATUS_INFO[detection.status];

  return (
    <div className="flex flex-col h-full">
      {/* Status badge */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <info.icon className={`h-4 w-4 ${info.color}`} />
          <span className="text-sm font-medium">{info.label}</span>
          {detection.board && (
            <span className="text-xs text-muted-foreground ml-auto">{detection.board}</span>
          )}
        </div>
        {detection.reason && (
          <p className="text-xs text-muted-foreground mt-1">{detection.reason}</p>
        )}
      </div>

      {detection.status === "detected" && detection.fields ? (
        <>
          {/* Field list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {detection.fields.map((field, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{field.fieldLabel}</p>
                  <p className="text-sm font-medium truncate">{field.value || "—"}</p>
                </div>
                <ConfidenceDot score={field.confidence} />
                <button className="text-muted-foreground hover:text-foreground">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t flex gap-2">
            <button
              onClick={() => void handleFill()}
              disabled={filling}
              className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {filling ? "Filling…" : "Fill form"}
            </button>
          </div>
        </>
      ) : detection.status === "none" ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            We&apos;ll wake up when you open an application page.
          </p>
        </div>
      ) : detection.status === "unsupported" ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center gap-3">
          <p className="text-sm text-muted-foreground">This page isn&apos;t supported yet.</p>
          <button
            onClick={() => browser.tabs.create({ url: `${import.meta.env.VITE_WEB_URL ?? "https://app.applyflow.io"}/contact?subject=Unsupported+board` })}
            className="text-sm text-primary hover:underline"
          >
            Report this site
          </button>
        </div>
      ) : null}
    </div>
  );
}
