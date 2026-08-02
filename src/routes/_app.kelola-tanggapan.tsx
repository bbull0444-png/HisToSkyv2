import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
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
import { fetchMeetings } from "@/features/meetings/meetingsApi";
import { supabase } from "@/lib/supabase";
import {
  fetchAllResponsesForTeacher,
  type StudentResponseWithRelations,
} from "@/features/responses/studentResponses";

export const Route = createFileRoute("/_app/kelola-tanggapan")({
  beforeLoad: requireGuru,
  loader: async () => {
    const [meetings, responses] = await Promise.all([
      fetchMeetings(),
      fetchAllResponsesForTeacher(),
    ]);
    return { meetings, responses };
  },
  component: KelolaTanggapanPage,
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

interface GroupedResponses {
  groupId: number | null;
  groupName: string | null;
  items: StudentResponseWithRelations[];
}

function KelolaTanggapanPage() {
  const { meetings, responses: initialResponses } = Route.useLoaderData();
  const [responses, setResponses] = useState<StudentResponseWithRelations[]>(initialResponses);
  const [meetingId, setMeetingId] = useState<string>("all");

  useEffect(() => {
    // Selalu refresh daftar tanggapan sekali saat halaman mount — data
    // loader cuma jadi initial state dan tidak pernah di-refresh ulang.
    fetchAllResponsesForTeacher().then(setResponses);
  }, []);

  useEffect(() => {
    // Live-update: begitu ada siswa menulis/mengubah tanggapan, halaman
    // guru otomatis refresh tanpa perlu reload. Kalau tabel belum masuk
    // publikasi realtime, subscription tidak mengirim event (tidak error).
    const channel = supabase
      .channel("student-responses-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_responses" }, () => {
        fetchAllResponsesForTeacher().then(setResponses);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const meetingOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const m of meetings) seen.set(m.id, m.title);
    for (const r of responses) {
      if (!seen.has(r.meeting_id)) seen.set(r.meeting_id, r.meeting_title);
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, title]) => ({ id, title }));
  }, [meetings, responses]);

  const groups = useMemo<GroupedResponses[]>(() => {
    const filtered =
      meetingId === "all" ? responses : responses.filter((r) => r.meeting_id === Number(meetingId));

    const map = new Map<number | null, StudentResponseWithRelations[]>();
    for (const r of filtered) {
      const arr = map.get(r.group_id) ?? [];
      arr.push(r);
      map.set(r.group_id, arr);
    }

    return Array.from(map.entries())
      .sort((a, b) => (a[0] ?? Number.MAX_SAFE_INTEGER) - (b[0] ?? Number.MAX_SAFE_INTEGER))
      .map(([groupId, items]) => ({
        groupId,
        groupName: items[0]?.group_name ?? null,
        items: [...items].sort((x, y) => x.student_name.localeCompare(y.student_name)),
      }));
  }, [responses, meetingId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Tanggapan</h1>
          <p className="text-sm text-muted-foreground">
            Tinjau tanggapan tertulis siswa per kelompok CIRC.
          </p>
        </div>

        <Select value={meetingId} onValueChange={setMeetingId}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Pilih pertemuan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Pertemuan</SelectItem>
            {meetingOptions.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                Pertemuan {m.id} — {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada tanggapan yang dikirim siswa.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <GroupCard key={group.groupId ?? "tanpa-kelompok"} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }: { group: GroupedResponses }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {group.groupName ?? "Tanpa Kelompok"}
          </span>
          <Badge variant="secondary">{group.items.length} tanggapan</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.items.map((r) => (
          <div key={r.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{r.student_name}</div>
              <Badge variant="outline">Pertemuan {r.meeting_id}</Badge>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{r.response}</p>
            <p className="mt-2 text-xs text-muted-foreground">{formatRelative(r.updated_at)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
