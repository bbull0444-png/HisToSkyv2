import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { startPresenceHeartbeat } from "@/features/presence/presence";

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
const SISWA_ONLY_PATHS = ["/refleksi-saya", "/nilai", "/pretest", "/posttest"];

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

  useEffect(() => {
    if (loading || !user || user.role !== "siswa") return;
    return startPresenceHeartbeat();
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Memuat…
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div
        className="relative flex min-h-screen w-full overflow-hidden"
        style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, #0B1330 0%, #060B18 60%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.4) 50%, transparent 50%)," +
              "radial-gradient(1px 1px at 75% 60%, rgba(255,255,255,0.3) 50%, transparent 50%)," +
              "radial-gradient(1.5px 1.5px at 45% 80%, rgba(255,255,255,0.35) 50%, transparent 50%)",
            backgroundSize: "500px 500px",
          }}
        />
        <AppSidebar />
        <div className="relative z-10 flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm font-medium text-[#9AA3C2]">
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