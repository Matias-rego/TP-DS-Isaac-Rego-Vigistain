// AuthContext.tsx
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from '@/api/client';
import { queryClient } from "@/lib/queryClient";
import { notifier } from "@/notifications/notifier";

interface User {
  id_user:       number;
  userName:      string;
  email:         string;
  rol:           string;
  status:        boolean;
  urlPicture:    string;
}

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const getMe = async () => {
    try {
      const data = await api<User>("/api/auth/me", { silent: true, authRedirect: false });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();

    const onUnauthorized = () => {
      if (!userRef.current) return; // varios 401 simultáneos: avisar una sola vez
      setUser(null);
      queryClient.clear();
      notifier.warning("Tu sesión expiró. Iniciá sesión nuevamente");
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuth: !!user, loading, refetchUser: getMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};