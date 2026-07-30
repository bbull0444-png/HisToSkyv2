import { getStoredUser } from "@/features/auth/AuthContext";
import { MEETINGS } from "./data";
import type { MeetingProgressStatus } from "./types";

/**
 * Progress belajar siswa per pertemuan.
 *
 * Disimpan di localStorage, terpisah PER SISWA (key memakai user.id),
 * supaya beberapa akun siswa yang login bergantian di browser yang sama
 * tidak saling menimpa progres.
 *
 * Ini masih penyimpanan sisi klien (selaras dengan auth yang saat ini
 * juga client-side). Kalau backend Supabase sudah dipasang, ganti
 * implementasi di file ini dengan tabel `meeting_progress` — pemanggil
 * (`isMeetingUnlocked`, `markMeetingCompleted`, dst.) tidak perlu berubah.
 */

type CompletionMap = Record<number, true>;

function storageKey(userId: string): string {
  return `histosky.progress.${userId}`;
}

function loadCompletionMap(): CompletionMap {
  const user = getStoredUser();
  if (!user) return {};
  try {
    const raw = localStorage.getItem(storageKey(user.id));
    return raw ? (JSON.parse(raw) as CompletionMap) : {};
  } catch {
    return {};
  }
}

function saveCompletionMap(map: CompletionMap) {
  const user = getStoredUser();
  if (!user) return;
  localStorage.setItem(storageKey(user.id), JSON.stringify(map));
}

export function isMeetingCompleted(meetingId: number): boolean {
  const map = loadCompletionMap();
  return map[meetingId] === true;
}

/**
 * Pertemuan 1 selalu terbuka. Pertemuan N terbuka hanya jika
 * pertemuan N-1 sudah completed.
 */
export function isMeetingUnlocked(meetingId: number): boolean {
  if (meetingId <= 1) return true;
  return isMeetingCompleted(meetingId - 1);
}

/**
 * Tandai pertemuan selesai (dipanggil dari tombol "Tandai Selesai" di
 * tahap terakhir/Penghargaan). Otomatis membuka pertemuan berikutnya.
 */
export function markMeetingCompleted(meetingId: number) {
  const map = loadCompletionMap();
  map[meetingId] = true;
  saveCompletionMap(map);
}

/**
 * Status gabungan untuk tampilan kartu di /materi:
 * - locked: pertemuan sebelumnya belum completed
 * - completed: siswa sudah menandai selesai
 * - in-progress: siswa pernah membuka tapi belum menandai selesai
 * - not-started: belum pernah dibuka
 *
 * `lastOpenedStage` (opsional) dipakai untuk membedakan not-started vs
 * in-progress; disimpan ringan lewat key terpisah supaya tidak mengotori
 * completion map.
 */
export function getMeetingProgressStatus(meetingId: number): MeetingProgressStatus {
  if (!isMeetingUnlocked(meetingId)) return "locked";
  if (isMeetingCompleted(meetingId)) return "completed";
  if (hasOpened(meetingId)) return "in-progress";
  return "not-started";
}

function openedStorageKey(userId: string): string {
  return `histosky.progress.opened.${userId}`;
}

function hasOpened(meetingId: number): boolean {
  const user = getStoredUser();
  if (!user) return false;
  try {
    const raw = localStorage.getItem(openedStorageKey(user.id));
    const opened = raw ? (JSON.parse(raw) as Record<number, true>) : {};
    return opened[meetingId] === true;
  } catch {
    return false;
  }
}

export function markMeetingOpened(meetingId: number) {
  const user = getStoredUser();
  if (!user) return;
  try {
    const raw = localStorage.getItem(openedStorageKey(user.id));
    const opened = raw ? (JSON.parse(raw) as Record<number, true>) : {};
    opened[meetingId] = true;
    localStorage.setItem(openedStorageKey(user.id), JSON.stringify(opened));
  } catch {
    // ignore
  }
}

export function getOverallProgress(): { completed: number; total: number } {
  const total = MEETINGS.length;
  const map = loadCompletionMap();
  const completed = Object.keys(map).length;
  return { completed, total };
}
