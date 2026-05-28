"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  email?: string;
  userId?: string;
  status: "open" | "in_progress" | "resolved";
  createdAt?: { seconds: number };
  updatedAt?: { seconds: number };
}

const STATUS_BADGE: Record<SupportTicket["status"], "default" | "secondary" | "outline"> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
};

export default function AdminSupportPage(): React.ReactElement {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    const q = query(collection(db, "supportTickets"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SupportTicket, "id">) })));
    });
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    await updateDoc(doc(db, "supportTickets", id), {
      status: "resolved",
      updatedAt: serverTimestamp(),
    });
    load();
  };

  const filterTickets = (status?: SupportTicket["status"]) =>
    (tickets ?? []).filter(
      (t) =>
        (!status || t.status === status) &&
        [t.subject, t.email, t.message].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase()),
        ),
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Support</h1>
        <p className="text-muted-foreground text-sm">User support tickets.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            Open
            {tickets && (
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                {filterTickets("open").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress">In progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        {(["open", "in_progress", "resolved"] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {tickets === null ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : filterTickets(status).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                <MessageSquare className="text-muted-foreground mb-3 h-10 w-10" />
                <p className="text-sm text-muted-foreground">No {status.replace("_", " ")} tickets.</p>
              </div>
            ) : (
              <div className="divide-y rounded-lg border">
                {filterTickets(status).map((ticket) => (
                  <div key={ticket.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <p className="text-muted-foreground text-xs">{ticket.email ?? "Anonymous"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={STATUS_BADGE[ticket.status]}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                        {ticket.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void resolve(ticket.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                    {ticket.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
