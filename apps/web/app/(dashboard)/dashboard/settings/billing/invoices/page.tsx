"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  date: number;
  amount: number;
  status: "paid" | "open" | "void";
  pdfUrl?: string;
  hostedUrl?: string;
}

export default function InvoicesPage(): React.ReactElement {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/stripe/invoices")
      .then((r) => r.json())
      .then((data) => setInvoices((data as { invoices: Invoice[] }).invoices ?? []))
      .catch(() => setInvoices([]));
  }, [user]);

  const STATUS_VARIANT: Record<Invoice["status"], "default" | "secondary" | "outline"> = {
    paid: "default",
    open: "secondary",
    void: "outline",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Invoices</h2>
        <p className="text-muted-foreground text-sm">Your billing history.</p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium">Invoice</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices === null ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{inv.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.date * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">${(inv.amount / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[inv.status]}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {inv.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(inv.pdfUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {inv.hostedUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(inv.hostedUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
