"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";

interface JobBoard {
  id: string;
  name: string;
  domain: string;
  supported: boolean;
  successRate?: number;
  selectorsVersion?: string;
  updatedAt?: { seconds: number };
}

const DEFAULT_BOARDS: JobBoard[] = [
  { id: "linkedin", name: "LinkedIn", domain: "linkedin.com", supported: true, successRate: 92, selectorsVersion: "2.4" },
  { id: "indeed", name: "Indeed", domain: "indeed.com", supported: true, successRate: 88, selectorsVersion: "1.9" },
  { id: "greenhouse", name: "Greenhouse", domain: "greenhouse.io", supported: true, successRate: 96, selectorsVersion: "3.1" },
  { id: "lever", name: "Lever", domain: "jobs.lever.co", supported: true, successRate: 94, selectorsVersion: "2.0" },
  { id: "workday", name: "Workday", domain: "myworkdayjobs.com", supported: true, successRate: 78, selectorsVersion: "1.5" },
  { id: "ashby", name: "Ashby", domain: "ashbyhq.com", supported: true, successRate: 91, selectorsVersion: "1.2" },
];

export default function AdminJobBoardsPage(): React.ReactElement {
  const router = useRouter();
  const [boards, setBoards] = useState<JobBoard[] | null>(null);

  useEffect(() => {
    getDocs(collection(db, "jobBoards")).then((snap) => {
      if (snap.empty) {
        setBoards(DEFAULT_BOARDS);
      } else {
        setBoards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobBoard, "id">) })));
      }
    });
  }, []);

  const toggleSupport = async (board: JobBoard) => {
    setBoards((prev) => prev?.map((b) => b.id === board.id ? { ...b, supported: !b.supported } : b) ?? null);
    try {
      await updateDoc(doc(db, "jobBoards", board.id), { supported: !board.supported });
    } catch { /* doc may not exist yet */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Job boards</h1>
        <p className="text-muted-foreground text-sm">Manage supported job boards and their selectors.</p>
      </div>

      <div className="rounded-lg border divide-y">
        {boards === null ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          ))
        ) : (
          boards.map((board) => (
            <div key={board.id} className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{board.name}</span>
                  <span className="text-muted-foreground text-xs">{board.domain}</span>
                  {board.selectorsVersion && (
                    <Badge variant="outline" className="text-xs">v{board.selectorsVersion}</Badge>
                  )}
                </div>
                {board.successRate !== undefined && (
                  <p className="text-xs text-muted-foreground">Success rate: {board.successRate}%</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={board.supported}
                  onCheckedChange={() => void toggleSupport(board)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/job-boards/${board.id}`)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
