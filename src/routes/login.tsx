import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, BookOpenCheck, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AuthProvider, useAuth, type UserRole } from "@/features/auth/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk · HisToSky" },
      { name: "description", content: "Masuk ke HisToSky sebagai siswa atau guru." },
    ],
  }),
  component: () => (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  ),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("siswa");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password, role);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 lg:flex">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <ScrollText className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">HisToSky</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Menyusuri jejak sejarah, membangun pemahaman bersama.
            </h1>
            <p className="text-primary-foreground/80">
              Platform pembelajaran sejarah berbasis model Cooperative Learning tipe{" "}
              <span className="font-semibold">Cooperative Integrated Reading and Composition</span>{" "}
              (CIRC).
            </p>
          </div>
          <div className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} HisToSky · Belajar sejarah, meraih langit.
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <ScrollText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HisToSky</span>
            </div>
            <h2 className="text-2xl font-bold">Masuk ke akun</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih mode dan masukkan kredensial kamu.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setRole("siswa")}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  role === "siswa"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpenCheck className="h-4 w-4" /> Siswa
              </button>
              <button
                type="button"
                onClick={() => setRole("guru")}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  role === "guru"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Guru
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "guru" ? "Siberyanhusky" : "nama_siswa"}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Memproses…" : `Masuk sebagai ${role === "guru" ? "Guru" : "Siswa"}`}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
