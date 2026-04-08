import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { http } from "@/lib/http";
import type { AuthUser } from "@/modules/shared/types/domain";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await http<{ user: AuthUser | null }>("/api/auth/session");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const data = await http<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: payload
    });
    setUser(data.user);
  };

  const logout = async () => {
    await http<{ message: string }>("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, logout, refresh }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
