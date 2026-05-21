import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface FieldMap {
  fieldName: string;
  fieldLabel: string;
  value: string;
  confidence: number;
  alternatives?: string[];
}

interface Props {
  company?: string;
  role?: string;
  fields: FieldMap[];
  onFillAll: (fields: FieldMap[]) => void;
  onClose: () => void;
}

function ConfidenceDot({ score }: { score: number }): React.ReactElement {
  const cls = score >= 0.8 ? "bg-green-500" : score >= 0.5 ? "bg-amber-500" : "bg-red-500";
  return <span className={`h-2 w-2 rounded-full inline-block shrink-0 ${cls}`} />;
}

export function ReviewPanel({ company, role, fields: initialFields, onFillAll, onClose }: Props): React.ReactElement {
  const [fields, setFields] = useState(initialFields);

  const updateValue = (index: number, value: string) => {
    setFields((prev) => prev.map((f, i) => i === index ? { ...f, value } : f));
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-background border-l shadow-2xl flex flex-col z-[2147483647]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{company ?? "Application"}</p>
          {role && <p className="text-xs text-muted-foreground truncate">{role}</p>}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-3 shrink-0">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Field list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {fields.map((field, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <ConfidenceDot score={field.confidence} />
              <label className="text-xs text-muted-foreground">{field.fieldLabel}</label>
            </div>
            <div className="relative">
              <input
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                value={field.value}
                onChange={(e) => updateValue(i, e.target.value)}
              />
              {field.alternatives && field.alternatives.length > 0 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 border rounded-md py-2 text-sm hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onFillAll(fields)}
          className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Fill all
        </button>
      </div>
    </div>
  );
}
