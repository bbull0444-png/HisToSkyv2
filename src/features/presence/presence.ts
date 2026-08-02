import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";

const HEARTBEAT_INTERVAL_MS = 45_000;
export const ONLINE_THRESHOLD_MS = 2 * 60_000; // safety-net: kalau denyut terakhir > 2 menit, dianggap offline walau flag is_online masih true (jaga2 browser crash/tab ke-close paksa tanpa sempat kirim status offline)

function currentStudentId(): number | null {
  const user = getStoredUser();
  if (!user || user.role !== "siswa") return null;
  const id = Number(user.id);
  return Number.isFinite(id) ? id : null;
}

async function setStatus(online: boolean) {
  const studentId = currentStudentId();
  if (studentId === null) return;

  const { error } = await supabase
    .from("students")
    .update({ is_online: online, last_active_at: new Date().toISOString() })
    .eq("id", studentId);

  if (error) {
    // Sengaja cuma console.error, bukan toast — heartbeat/status jalan
    // diam-diam, gak enak kalau muncul notif tiap gagal. Tapi errornya
    // HARUS kelihatan di console biar gampang ke-debug (RLS/kolom hilang,
    // dll), gak ketelen diem-diem.
    console.error(`[presence] gagal set status ${online ? "online" : "offline"}:`, error.message);
  }
}

/**
 * Panggil sekali di layout siswa (mis. di `_app.tsx`). Behaviornya:
 * - Langsung set online begitu dipanggil (siswa buka halaman).
 * - Kirim ulang tiap HEARTBEAT_INTERVAL_MS selama tab kebuka DAN aktif
 *   (tidak ngirim heartbeat kalau tab lagi disembunyikan, biar gak nyisain
 *   status "online" palsu buat tab yang ditinggal minimize lama).
 * - Begitu tab disembunyikan (pindah tab lain / minimize) -> langsung set
 *   offline SAAT ITU JUGA, `last_active_at` jadi jam persis dia pergi,
 *   jadi "X menit lalu" di panel guru akurat dari momen dia beneran pergi.
 * - Begitu tab dibuka lagi -> langsung set online lagi.
 * - Cleanup (unmount/logout) -> set offline juga.
 *
 * Return function buat berhenti semuanya — panggil di cleanup useEffect.
 */
export function startPresenceHeartbeat(): () => void {
  setStatus(true);

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const startInterval = () => {
    if (intervalId) return;
    intervalId = setInterval(() => setStatus(true), HEARTBEAT_INTERVAL_MS);
  };
  const stopInterval = () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };

  startInterval();

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      stopInterval();
      setStatus(false);
    } else {
      setStatus(true);
      startInterval();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Best-effort: kalau tab beneran ditutup (bukan cuma disembunyikan).
  // Tidak dijamin selalu sempat terkirim (browser bisa langsung matiin
  // koneksi), tapi safety-net waktu (ONLINE_THRESHOLD_MS di `isOnline`)
  // nutupin kasus ini kalau gagal.
  window.addEventListener("pagehide", () => setStatus(false));

  return () => {
    stopInterval();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    setStatus(false);
  };
}

interface PresenceFields {
  is_online: boolean;
  last_active_at: string | null;
}

/**
 * Status online GABUNGAN: percaya flag `is_online` dari DB, tapi tetap
 * dicek ulang lewat waktu (`last_active_at`) sebagai safety-net — kalau
 * flag-nya masih `true` tapi denyut terakhir udah lebih dari
 * ONLINE_THRESHOLD_MS yang lalu (mis. laptop mati mendadak, event
 * "pagehide" gak sempat kekirim), tetap dianggap offline, bukan nyangkut
 * "online" selamanya.
 */
export function isOnline(student: PresenceFields): boolean {
  if (!student.is_online || !student.last_active_at) return false;
  return Date.now() - new Date(student.last_active_at).getTime() < ONLINE_THRESHOLD_MS;
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