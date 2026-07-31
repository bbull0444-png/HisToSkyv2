import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MEETINGS } from "@/features/meetings/data";
import { fetchProgressMap, getMeetingProgressStatusIn } from "@/features/meetings/progress";
import { fetchMyReflections, saveMyReflection, type Reflection } from "@/features/reflections/reflections";

export const Route = createFileRoute("/_app/refleksi-saya")({
  loader: async () => {
    const [progressMap, reflectionMap] = await Promise.all([
      fetchProgressMap(),
      fetchMyReflections(),
    ]);
    return { progressMap, reflectionMap };
  },
  component: RefleksiSayaPage,
});

function RefleksiSayaPage() {
  const { progressMap, reflectionMap } = Route.useLoaderData();

  // Refleksi masuk akal ditulis untuk pertemuan yang sudah mulai dipelajari
  // (tidak terkunci) — bukan yang belum dibuka sama sekali.
  const availableMeetings = MEETINGS.filter(
    (m) => getMeetingProgressStatusIn(progressMap, m.id) !== "locked"
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
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(existing ? Date.now() : null);
  const dirty = content !== (existing?.content ?? "");

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await saveMyReflection(meetingId, content.trim());
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
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
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {savedAt && !dirty && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan
              </span>
            )}
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving || !content.trim() || !dirty}>
            {saving ? "Menyimpan..." : "Simpan Refleksi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}