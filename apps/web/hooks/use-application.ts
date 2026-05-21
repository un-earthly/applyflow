"use client";

import { useEffect, useState, useCallback } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "./use-auth";
import type { Application, UpdateApplicationInput } from "@repo/shared";

export function useApplication(id: string | undefined) {
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) {
      setApplication(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "applications", id),
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
  }, [id, user]);

  const update = useCallback(
    async (data: UpdateApplicationInput) => {
      if (!id || !user) return;
      await updateDoc(doc(db, "users", user.uid, "applications", id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [id, user]
  );

  const remove = useCallback(async () => {
    if (!id || !user) return;
    await deleteDoc(doc(db, "users", user.uid, "applications", id));
  }, [id, user]);

  return { application, loading, update, remove };
}
