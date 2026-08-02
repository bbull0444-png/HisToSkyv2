import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";

const HEARTBEAT_INTERVAL_MS = 45_000;
export const ONLINE_THRESHOLD_MS = 2 * 60_000; // dianggap "aktif sekarang" kalau denyut terakhir < 2 menit

async function pingOnce() {
  const user = getStoredUser();
  if (!user || user.role !== "siswa") return;

  const studentId = Number(user.id);
  if (!Number.isFinite(studentId)) return;

  const { error } = await supabase
    .from("students")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", studentId);

  if (error) {
    // Sengaja cuma console.error, bukan toast — heartbeat jalan diam-diam
    // tiap 45 detik, gak enak kalau muncul notif tiap gagal. Tapi errornya
    // HARUS kelihatan di console biar gampang ke-debug (RLS/kolom hilang,
    // dll), gak ketelen diem-diem kaya sebelumnya.
    console.error("[presence] gagal update last_active_at:", error.message);
  }
}

/**
 * Panggil sekali di layout siswa (mis. di `_app.tsx`). Ngirim heartbeat
 * pertama langsung saat dipanggil, lalu tiap HEARTBEAT_INTERVAL_MS selama
 * komponennya tetap ter-mount (artinya: selama tab aplikasi kebuka).
 * Return function buat berhenti — panggil di cleanup useEffect.
 */
export function startPresenceHeartbeat(): () => void {
  pingOnce();
  const id = setInterval(pingOnce, HEARTBEAT_INTERVAL_MS);
  return () => clearInterval(id);
}

export function isOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MS;
}

/** "Baru saja" / "5 menit lalu" / "2 jam lalu" / "3 hari lalu" */
export function formatLastActive(lastActiveAt: string | null): string {
  if (!lastActiveAt) return "Belum pernah aktif";

  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Baru saja";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}