import { redirect } from "@tanstack/react-router";
import { getStoredUser } from "@/features/auth/AuthContext";

/**
 * Guard untuk route khusus guru. Dipasang di `beforeLoad` route,
 * dijalankan oleh TanStack Router SEBELUM komponen halaman dirender —
 * jadi siswa yang mengetik URL guru secara langsung tidak akan pernah
 * melihat komponennya sama sekali, bukan sekadar tombolnya disembunyikan.
 *
 * - Belum login sama sekali -> lempar ke /login.
 * - Login tapi bukan guru (siswa) -> lempar ke halaman materi siswa.
 *
 * Pakai di setiap route guru:
 *   export const Route = createFileRoute("/_app/kelola-materi/")({
 *     beforeLoad: requireGuru,
 *     component: KelolaMateri,
 *   });
 */
export function requireGuru() {
  const user = getStoredUser();

  if (!user) {
    throw redirect({ to: "/login" });
  }

  if (user.role !== "guru") {
    throw redirect({ to: "/materi" });
  }
}
