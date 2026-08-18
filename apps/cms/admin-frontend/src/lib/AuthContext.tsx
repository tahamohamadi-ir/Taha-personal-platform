import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  fetchMe,
  getCsrf,
  login as apiLogin,
  logout as apiLogout,
  setCsrfToken,
  setUnauthorizedHandler,
  type AdminUser,
} from "./api";

export type AuthStatus = "loading" | "anon" | "authed";

interface AuthContextValue {
  user: AdminUser | null;
  csrfToken: string | null;
  status: AuthStatus;
  login: (
    email: string,
    password: string,
    otpToken?: string
  ) => Promise<AdminUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [csrfToken, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    setUnauthorizedHandler(() => {
      if (!cancelled) {
        setUser(null);
        setStatus("anon");
      }
    });

    async function bootstrap(): Promise<void> {
      try {
        const token = await getCsrf();
        if (cancelled) return;
        setToken(token);
        const me = await fetchMe();
        if (cancelled) return;
        setUser(me);
        setStatus("authed");
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus("anon");
        }
      }
    }
    void bootstrap();

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, otpToken?: string) => {
      const token = await getCsrf();
      setToken(token);
      const me = await apiLogin(email, password, otpToken);
      const refreshed = await getCsrf();
      setCsrfToken(refreshed);
      setToken(refreshed);
      setUser(me);
      setStatus("authed");
      return me;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // local session is cleared regardless of network outcome
    } finally {
      setCsrfToken(null);
      setToken(null);
      setUser(null);
      setStatus("anon");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, csrfToken, status, login, logout }),
    [user, csrfToken, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthGuard(): ReactElement {
  const { status } = useAuth();
  if (status === "loading") {
    return <div className="admin-loading">در حال بارگذاری…</div>;
  }
  if (status !== "authed") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
