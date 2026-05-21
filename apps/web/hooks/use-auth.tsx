"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncSession(user: User | null): Promise<void> {
  if (!user) {
    await fetch("/api/auth/session", { method: "DELETE" });
    return;
  }
  const idToken = await user.getIdToken(true);
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
<<<<<<< HEAD
        document.cookie = "__session=1; path=/; SameSite=Lax; max-age=2592000";
      } else {
        document.cookie = "__session=; path=/; max-age=0";
=======
        try {
          await syncSession(u);
        } catch (e) {
          console.error("Session sync failed:", e);
        }
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await syncSession(cred.user);
  };

  const signUp = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await syncSession(cred.user);
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    await syncSession(cred.user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    await syncSession(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
