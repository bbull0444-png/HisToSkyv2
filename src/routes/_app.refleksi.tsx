import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requireGuru } from "@/lib/route-guards";
import {
  fetchAllReflectionsForTeacher,
  type ReflectionWithStudent,
} from "@/features/reflections/reflections";
import { fetchMeetings, type MeetingSummary } from "@/features/meetings/meetingsApi";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/refleksi")({
  beforeLoad: requireGuru,
  loader: async () => {
    const meetings = await fetchMeetings();
    return { meetings };
  },
  component: RefleksiPage,
});

function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function RefleksiPage() {
  const { meetings: initialMeetings } = Route.useLoaderData();
  const [meetings] = useState<MeetingSummary[]>(initialMeetings);
  const [meetingId, setMeetingId] = useState<string>(
    initialMeetings[0] ? String(initialMeetings[0].id) : "",
  );
  const [reflections, setReflections] = useState<ReflectionWithStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedMeeting = meetings.find((m) => String(m.id) === meetingId) ?? null;

  useEffect(() => {
    if (!meetingId) {
      setLoading(false);
      return;
    }
    const id = Number(meetingId);
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const rows = await fetchAllReflectionsForTeacher(id);
      if (!cancelled) {
        setReflections(rows);
        setLoading(false);
      }
    };

    load();

    // Live-update: begitu siswa manapun menulis/hapus refleksi di pertemuan
    // yang sedang dipilih, halaman ini otomatis refresh tanpa guru perlu
    // pindah/reload halaman. Payload realtime cuma kasih baris mentah (tanpa
    // nama siswa hasil join), jadi cara paling aman & sederhana adalah fetch
    // ulang daftar lengkap tiap kali ada perubahan — bukan nge-patch satu
    // baris manual.
    const channel = supabase
      .channel(`reflections-live-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reflections", filter: `meeting_id=eq.${id}` },
        () => {
          fetchAllReflectionsForTeacher(id).then((rows) => {
            if (!cancelled) setReflections(rows);
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Refleksi Siswa</h1>
          <p className="text-sm text-muted-foreground">
            Kumpulan refleksi dari siswa per pertemuan — diperbarui otomatis secara live.
          </p>
        </div>

        <Select value={meetingId} onValueChange={setMeetingId}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Pilih pertemuan" />
          </SelectTrigger>
          <SelectContent>
            {meetings.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                Pertemuan {m.order} — {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMeeting && (
        <div className="rounded-lg border p-4 text-sm">
          <span className="font-medium">
            Pertemuan {selectedMeeting.order} — {selectedMeeting.title}
          </span>
          <span className="text-muted-foreground">
            {" "}
            · {reflections.length} refleksi terkumpul
          </span>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat refleksi...</p>
      ) : reflections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada refleksi yang dikirim siswa untuk pertemuan ini.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reflections.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{r.student_name}</span>
                  <Badge variant="outline">Pertemuan {r.meeting_id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">"{r.content}"</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatRelative(r.updated_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
