"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import { TemplatePreview } from "@/components/resume/template-preview";

export function TemplatePicker({
  open, onOpenChange, currentId, onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const [hovered, setHovered] = useState<string | null>(null);
  void hovered;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 max-h-130 overflow-y-auto pr-1">
          {RESUME_TEMPLATES.map((tpl) => {
            const active = tpl.id === currentId;
            return (
              <button
                key={tpl.id}
                onClick={() => { onSelect(tpl.id); onOpenChange(false); }}
                onMouseEnter={() => setHovered(tpl.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all",
                  active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
                )}
              >
                <div className="relative overflow-hidden rounded" style={{ width: 168, height: 238 }}>
                  <div className="bg-muted/30 w-full h-full absolute inset-0" />
                  <TemplatePreview template={tpl} scale={0.212} />
                  {active && (
                    <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="text-xs font-semibold">{tpl.name}</div>
                  <div className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">{tpl.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
