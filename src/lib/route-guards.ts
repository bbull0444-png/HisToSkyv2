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
  // Guard ini baca localStorage, yang cuma ada di browser. Halaman ini
  // sempat dirender duluan di server (SSR TanStack Start) sebelum sampai
  // ke browser — kalau kita tetap paksa cek localStorage di server, hasilnya
  // selalu "null" (localStorage tidak ada di server), sehingga guru asli
  // yang hard-refresh salah dikira belum login dan dilempar ke /login.
  // Jadi guard ini hanya benar-benar menegakkan aturan di sisi client;
  // proteksi data sesungguhnya tetap dijaga oleh RLS Supabase (query dari
  // server tanpa sesi Supabase Auth guru akan ditolak database).
  if (typeof window === "undefined") return;

  const user = getStoredUser();

  if (!user) {
    throw redirect({ to: "/login" });
  }

  if (user.role !== "guru") {
    throw redirect({ to: "/materi" });
  }
}

/**
 * Kebalikan dari requireGuru: untuk halaman KHUSUS SISWA (Materi,
 * Refleksi Saya, Nilai, Pretest, Posttest). Tanpa ini, guru yang membuka
 * URL siswa langsung akan tetap bisa "mengetik" di halaman tersebut
 * walau tulisannya sebenarnya tidak pernah tersimpan (fungsi Supabase di
 * baliknya menolak akun non-siswa secara diam-diam) — membingungkan dan
 * terkesan seperti macet/nge-bug.
 */
export function requireSiswa() {
  if (typeof window === "undefined") return;

  const user = getStoredUser();

  if (!user) {
    throw redirect({ to: "/login" });
  }

  if (user.role !== "siswa") {
    throw redirect({ to: "/dashboard" });
  }
}