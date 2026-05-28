import { useState, useEffect } from "react";
import { Zap, X } from "lucide-react";

interface Props {
  boardName: string;
  onFill: () => void;
  onReview: () => void;
  onDismiss: () => void;
}

export function DetectorToast({ boardName, onFill, onReview, onDismiss }: Props): React.ReactElement {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 12000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-5 right-5 w-80 rounded-xl border bg-background shadow-2xl transition-all duration-300 z-[2147483647] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">We can fill this for you</p>
          <p className="text-xs text-muted-foreground mt-0.5">{boardName} application detected.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onReview}
              className="flex-1 border rounded-md py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              Review
            </button>
            <button
              onClick={onFill}
              className="flex-1 bg-primary text-primary-foreground rounded-md py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Fill
            </button>
          </div>
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
