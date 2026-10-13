import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types";
import { loadJSON, saveJSON, uid } from "../lib/utils";

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  users: StoredUser[];
  login: (email: string, password: string) => { ok: boolean; message: string };
  register: (name: string, email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  requestReset: (email: string) => { ok: boolean; message: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "lms_users";
const SESSION_KEY = "lms_session";

function seedAdmin(): StoredUser[] {
  return [
    {
      id: "user_admin",
      name: "Librarian",
      email: "admin@library.com",
      password: "admin123",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => {
    const existing = loadJSON<StoredUser[]>(USERS_KEY, []);
    if (existing.length > 0) return existing;
    const seed = seedAdmin();
    saveJSON(USERS_KEY, seed);
    return seed;
  });
  const [user, setUser] = useState<AuthUser | null>(() => loadJSON<AuthUser | null>(SESSION_KEY, null));

  useEffect(() => {
    saveJSON(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    if (user) saveJSON(SESSION_KEY, user);
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      users,
      login: (email, password) => {
        const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) return { ok: false, message: "No account found with this email." };
        if (found.password !== password) return { ok: false, message: "Incorrect password. Try again." };
        const { password: _pw, ...safe } = found;
        setUser(safe);
        return { ok: true, message: `Welcome back, ${safe.name}.` };
      },
      register: (name, email, password) => {
        const emailNorm = email.trim().toLowerCase();
        if (users.some((u) => u.email.toLowerCase() === emailNorm))
          return { ok: false, message: "An account with this email already exists." };
        const next: StoredUser = {
          id: uid("user"),
          name: name.trim(),
          email: email.trim(),
          password,
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [...prev, next]);
        const { password: _pw, ...safe } = next;
        setUser(safe);
        return { ok: true, message: "Account created. You are now signed in." };
      },
      logout: () => setUser(null),
      requestReset: (email) => {
        const found = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) return { ok: false, message: "No account found with this email." };
        return { ok: true, message: "Password reset link sent to your email (demo)." };
      },
    }),
    [user, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
