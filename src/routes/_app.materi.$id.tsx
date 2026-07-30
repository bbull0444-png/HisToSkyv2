import { createFileRoute, Link, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMeeting } from "@/features/meetings/data";
import { STAGES, type LearningStage } from "@/features/meetings/types";
import { fetchMateriKonten, type MateriKontenMap } from "@/lib/materi-konten";
import {
  isMeetingCompleted,
  isMeetingUnlocked,
  markMeetingCompleted,
  markMeetingOpened,
} from "@/features/meetings/progress";
import "@/components/editor/editor.css";

export const Route = createFileRoute("/_app/materi/$id")({
  loader: async ({ params }) => {
    const meetingId = Number(params.id);
    const meeting = getMeeting(meetingId);
    if (!meeting) throw notFound();

    // Siswa yang mengakses URL pertemuan terkunci langsung (belum
    // menyelesaikan pertemuan sebelumnya) dikembalikan ke daftar materi.
    // Guru boleh tetap melihat semua pertemuan untuk keperluan pratinjau,
    // jadi pengecekan ini hanya relevan untuk alur normal siswa.
    if (!isMeetingUnlocked(meetingId)) {
      throw redirect({ to: "/materi" });
    }

    const content = await fetchMateriKonten(meetingId);
    return { meeting, content };
  },
  component: MateriDetail,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">Pertemuan tidak ditemukan.</p>
      <Button asChild className="mt-4">
        <Link to="/materi">Kembali</Link>
      </Button>
    </div>
  ),
});

function MateriDetail() {
  const { meeting, content } = Route.useLoaderData();
  const navigate = useNavigate();
  const [stage, setStage] = useState<LearningStage>(STAGES[0].key);
  const [completed, setCompleted] = useState(() => isMeetingCompleted(meeting.id));
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const isLastStage = currentIdx === STAGES.length - 1;
  const progress = ((currentIdx + 1) / STAGES.length) * 100;

  useEffect(() => {
    markMeetingOpened(meeting.id);
  }, [meeting.id]);

  const goNext = () => {
    if (currentIdx < STAGES.length - 1) setStage(STAGES[currentIdx + 1].key);
  };
  const goPrev = () => {
    if (currentIdx > 0) setStage(STAGES[currentIdx - 1].key);
  };

  const handleComplete = () => {
    markMeetingCompleted(meeting.id);
    setCompleted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/materi">
              <ArrowLeft className="mr-1 h-4 w-4" /> Semua Pertemuan
            </Link>
          </Button>
          <div className="text-xs font-medium text-muted-foreground">
            Pertemuan {meeting.id}
          </div>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground">{meeting.subtitle}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-4">
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s, idx) => {
            const active = s.key === stage;
            const done = idx < currentIdx;
            return (
              <button
                key={s.key}
                onClick={() => setStage(s.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : done
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                {idx + 1}. {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <StageContent stage={stage} content={content} />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={currentIdx === 0}>
          Sebelumnya
        </Button>
        <div className="text-xs text-muted-foreground">
          Tahap {currentIdx + 1} dari {STAGES.length}
        </div>
        {isLastStage ? (
          completed ? (
            <Button disabled className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Pertemuan Selesai
            </Button>
          ) : (
            <Button onClick={handleComplete} className="gap-1.5">
              <PartyPopper className="h-4 w-4" />
              Tandai Selesai
            </Button>
          )
        ) : (
          <Button onClick={goNext}>Selanjutnya</Button>
        )}
      </div>

      {isLastStage && completed && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          Pertemuan {meeting.id} sudah kamu selesaikan. Pertemuan berikutnya sekarang terbuka.{" "}
          <button
            className="font-medium text-primary underline underline-offset-2"
            onClick={() => navigate({ to: "/materi" })}
          >
            Lihat daftar pertemuan
          </button>
        </div>
      )}
    </div>
  );
}

function StageContent({
  stage,
  content,
}: {
  stage: LearningStage;
  content: MateriKontenMap;
}) {
  const label = STAGES.find((s) => s.key === stage)?.label;
  const html = content[stage];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {html ? (
          <div className="prose prose-sm max-w-none leading-relaxed tiptap-editor-content">
            <div
              className="ProseMirror"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Materi untuk tahap ini belum tersedia.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
