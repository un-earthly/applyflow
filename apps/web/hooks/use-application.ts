"use client";

import { useEffect, useState, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Application, UpdateApplicationInput } from "@repo/shared";

export function useApplication(id: string | undefined) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setApplication(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "applications", id),
      (docSnap) => {
        if (docSnap.exists()) {
          setApplication({ id: docSnap.id, ...docSnap.data() } as Application);
        } else {
          setApplication(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Application query error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [id]);

  const update = useCallback(
    async (data: UpdateApplicationInput) => {
      if (!id) return;
      await updateDoc(doc(db, "applications", id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [id]
  );

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteDoc(doc(db, "applications", id));
  }, [id]);

  return { application, loading, update, remove };
}
