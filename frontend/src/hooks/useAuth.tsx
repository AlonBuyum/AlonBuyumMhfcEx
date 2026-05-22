import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearAuth, getUser, setAuth, type StoredUser } from "../lib/auth-storage";

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  signIn: (token: string, user: StoredUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => getUser());

  const signIn = useCallback((token: string, nextUser: StoredUser) => {
    setAuth(token, nextUser);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn,
      signOut,
    }),
    [user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
