import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthProvider>
      <Guarded />
    </AuthProvider>
  );
}

// Path yang hanya boleh diakses guru. `requireGuru` (beforeLoad) sudah
// menegakkan ini di client, tapi dilewati saat SSR karena localStorage
// tidak ada di server (lihat catatan di route-guards.ts). Cek client-side
// di sini jadi lapisan kedua yang jalan setelah hydration, khusus untuk
// kasus siswa hard-refresh langsung ke URL guru.
const GURU_ONLY_PATHS = [
  "/kelola-materi",
  "/kelola-kelompok",
  "/kelola-quiz",
  "/kelola-lkpd",
  "/rekap-nilai",
  "/laporan",
  "/data-siswa",
  "/pengaturan",
  "/refleksi",
];

// Kebalikannya: path khusus siswa. Tanpa ini, guru yang buka URL siswa
// (misal /refleksi-saya) bisa tetap berinteraksi dengan halamannya walau
// tulisannya diam-diam tidak pernah tersimpan — terkesan seperti macet/bug.
const SISWA_ONLY_PATHS = ["/materi", "/refleksi-saya", "/nilai", "/pretest", "/posttest"];

function Guarded() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (loading || !user) return;

    if (user.role !== "guru") {
      const isGuruOnly = GURU_ONLY_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
      if (isGuruOnly) navigate({ to: "/materi" });
      return;
    }

    const isSiswaOnly = SISWA_ONLY_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (isSiswaOnly) navigate({ to: "/dashboard" });
  }, [loading, user, pathname, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Memuat…
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground">
              HisToSky · Pembelajaran Sejarah Berbasis model Cooperative Learning tipe CIRC
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}