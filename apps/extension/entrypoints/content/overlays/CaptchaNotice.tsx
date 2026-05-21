import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  onDismiss: () => void;
}

export function CaptchaNotice({ onDismiss }: Props): React.ReactElement {
  const [visible, setVisible] = useState(true);

  if (!visible) return <></>;

  return (
    <div className="fixed top-0 left-0 right-0 z-[2147483647] bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center gap-3">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
        CAPTCHA detected — finish manually. We&apos;ll log it once you submit.
      </p>
      <button
        onClick={() => { setVisible(false); onDismiss(); }}
        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
