import { supabase } from "@/lib/supabase";
import { MEETINGS } from "./data";

export type PublishStatus = "draft" | "published";
export type PublishStatusMap = Record<number, PublishStatus>;

/**
 * Status publish/draft tiap pertemuan — dulunya cuma `useState` lokal di
 * halaman Kelola Materi (hilang tiap refresh, beda-beda per device).
 * Sekarang persisten di tabel `meeting_publish_status`.
 */
export async function fetchPublishStatusMap(): Promise<PublishStatusMap> {
  const { data, error } = await supabase.from("meeting_publish_status").select("meeting_id, status");

  const map: PublishStatusMap = {};
  // Fallback ke default statis kalau baris belum ada / query gagal,
  // supaya UI tidak pernah kosong total.
  for (const m of MEETINGS) map[m.id] = m.status as PublishStatus;

  if (!error && data) {
    for (const row of data) {
      map[row.meeting_id as number] = row.status as PublishStatus;
    }
  }
  return map;
}

export function isMeetingPublished(map: PublishStatusMap, meetingId: number): boolean {
  return map[meetingId] === "published";
}

export async function setMeetingPublishStatus(
  meetingId: number,
  status: PublishStatus
): Promise<void> {
  await supabase.from("meeting_publish_status").upsert(
    { meeting_id: meetingId, status, updated_at: new Date().toISOString() },
    { onConflict: "meeting_id" }
  );
}