import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "siswa" | "guru";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string, role: UserRole) => Promise<AuthUser>;
  logout: () => void;
  loading: boolean;
}

const STORAGE_KEY = "histosky.auth.user";

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth logic is intentionally isolated in this provider.
 * Replace `authenticate` with a real API/DB call later —
 * the rest of the app only depends on the context surface.
 */
async function authenticate(
  username: string,
  password: string,
  role: UserRole
): Promise<AuthUser> {

  if (role === "guru") {
    // Cari guru berdasarkan username
    const { data: guru, error: guruError } = await supabase
      .from("guru")
      .select("id, nama, email")
      .eq("username", username)
      .single();

    if (guruError || !guru) {
      throw new Error("Username guru tidak ditemukan");
    }

    // Login ke Supabase Auth menggunakan email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: guru.email,
      password,
    });

    if (error || !data.user) {
      throw new Error("Password guru tidak valid");
    }

    return {
      id: guru.id,
      username,
      name: guru.nama,
      role: "guru",
    };
  }

  // Student demo: any non-empty credentials
  if (!username.trim() || !password.trim()) {
    throw new Error("Username dan password wajib diisi");
  }
  return {
    id: `siswa-${username.toLowerCase()}`,
    username,
    name: username,
    role: "siswa",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, role: UserRole) => {
    const u = await authenticate(username, password, role);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
