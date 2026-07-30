import { supabase } from "./supabase";
import { STAGES, type LearningStage } from "@/features/meetings/types";
import { getMeeting } from "@/features/meetings/data";

export type MateriKontenMap = Record<LearningStage, string>;

// konten default (data.ts) dipakai sebagai fallback pertama kali,
// sebelum guru pernah nyimpen apapun lewat editor
function stageDefaultToHtml(value: string | string[] | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) {
    return `<ul>${value.map((v) => `<li>${v}</li>`).join("")}</ul>`;
  }
  return `<p>${value}</p>`;
}

export function getDefaultContent(meetingId: number): MateriKontenMap {
  const meeting = getMeeting(meetingId);
  const result = {} as MateriKontenMap;
  for (const stage of STAGES) {
    const raw = meeting?.[stage.key] as string | string[] | undefined;
    result[stage.key] = stageDefaultToHtml(raw);
  }
  return result;
}

/**
 * Ambil konten materi per pertemuan. Kalau suatu step belum pernah
 * disimpan ke Supabase, dipakai fallback dari data.ts.
 */
export async function fetchMateriKonten(
  meetingId: number,
): Promise<MateriKontenMap> {
  const result = getDefaultContent(meetingId);

  const { data, error } = await supabase
    .from("materi_konten")
    .select("step, content_html")
    .eq("meeting_id", meetingId);

  if (error) {
    console.error("Gagal memuat materi_konten:", error);
    return result;
  }

  for (const row of data ?? []) {
    result[row.step as LearningStage] = row.content_html;
  }
  return result;
}

export async function saveMateriKontenStep(
  meetingId: number,
  step: LearningStage,
  contentHtml: string,
) {
  const { error } = await supabase.from("materi_konten").upsert(
    {
      meeting_id: meetingId,
      step,
      content_html: contentHtml,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "meeting_id,step" },
  );

  if (error) throw error;
}