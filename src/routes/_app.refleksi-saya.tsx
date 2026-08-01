import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchMeetings } from "@/features/meetings/meetingsApi";
import { fetchProgressMap, getMeetingProgressStatusIn } from "@/features/meetings/progress";
import {
  fetchMyReflections,
  saveMyReflection,
  deleteMyReflection,
  type Reflection,
} from "@/features/reflections/reflections";
import { requireSiswa } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/refleksi-saya")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const [allMeetings, progressMap, reflectionMap] = await Promise.all([
      fetchMeetings(),
      fetchProgressMap(),
      fetchMyReflections(),
    ]);
    const publishedMeetings = allMeetings.filter((m) => m.status === "published");
    const orderedIds = publishedMeetings.map((m) => m.id);
    return { publishedMeetings, orderedIds, progressMap, reflectionMap };
  },
  component: RefleksiSayaPage,
});

function RefleksiSayaPage() {
  const { publishedMeetings, orderedIds, progressMap, reflectionMap } = Route.useLoaderData();

  // Refleksi masuk akal ditulis untuk pertemuan yang sudah mulai dipelajari
  // (tidak terkunci) — bukan yang belum dibuka sama sekali.
  const availableMeetings = publishedMeetings.filter(
    (m) => getMeetingProgressStatusIn(orderedIds, progressMap, m.id) !== "locked"
  );

  if (availableMeetings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Refleksi Saya</h1>
          <p className="text-sm text-muted-foreground">
            Tulis refleksi belajarmu setelah mempelajari tiap pertemuan.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Belum ada pertemuan yang bisa direfleksikan. Mulai belajar dulu di halaman Materi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refleksi Saya</h1>
        <p className="text-sm text-muted-foreground">
          Tulis refleksi belajarmu setelah mempelajari tiap pertemuan.
        </p>
      </div>

      <div className="space-y-4">
        {availableMeetings.map((m) => (
          <ReflectionCard
            key={m.id}
            meetingId={m.id}
            meetingTitle={m.title}
            existing={reflectionMap[m.id]}
          />
        ))}
      </div>
    </div>
  );
}

function ReflectionCard({
  meetingId,
  meetingTitle,
  existing,
}: {
  meetingId: number;
  meetingTitle: string;
  existing?: Reflection;
}) {
  const [content, setContent] = useState(existing?.content ?? "");
  const [hasSaved, setHasSaved] = useState(!!existing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await saveMyReflection(meetingId, content.trim());
      setHasSaved(true);
      toast.success("Refleksi berhasil dikirim");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim refleksi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMyReflection(meetingId);
      setContent("");
      setHasSaved(false);
      toast.success("Refleksi dihapus, silakan tulis ulang");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus refleksi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Pertemuan {meetingId} — {meetingTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Apa yang kamu pelajari dari pertemuan ini? Bagian mana yang masih membingungkan?"
          rows={3}
          disabled={hasSaved}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {hasSaved && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> Refleksi berhasil dikirim
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {hasSaved ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Menghapus..." : "Hapus & Tulis Ulang"}
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
                {saving ? "Menyimpan..." : "Simpan Refleksi"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}