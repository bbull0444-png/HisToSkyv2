import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMeeting } from "@/features/meetings/data";
import { STAGES, type LearningStage, type Meeting } from "@/features/meetings/types";

export const Route = createFileRoute("/_app/materi/$id")({
  loader: ({ params }) => {
    const meeting = getMeeting(Number(params.id));
    if (!meeting) throw notFound();
    return { meeting };
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
  const { meeting } = Route.useLoaderData();
  const [stage, setStage] = useState<LearningStage>("pendahuluan");
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const progress = ((currentIdx + 1) / STAGES.length) * 100;

  const goNext = () => {
    if (currentIdx < STAGES.length - 1) setStage(STAGES[currentIdx + 1].key);
  };
  const goPrev = () => {
    if (currentIdx > 0) setStage(STAGES[currentIdx - 1].key);
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
          <div className="text-xs font-medium text-muted-foreground">Pertemuan {meeting.id}</div>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground">{meeting.subtitle}</p>
        </div>
      </div>

      {/* Stage stepper */}
      <div className="rounded-xl border bg-background p-4">
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
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

      <StageContent stage={stage} meeting={Route.useLoaderData().meeting} />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={currentIdx === 0}>
          Sebelumnya
        </Button>
        <div className="text-xs text-muted-foreground">
          Tahap {currentIdx + 1} dari {STAGES.length}
        </div>
        <Button onClick={goNext} disabled={currentIdx === STAGES.length - 1}>
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

function StageContent({ stage, meeting }: { stage: LearningStage; meeting: Meeting }) {
  const label = STAGES.find((s) => s.key === stage)?.label;

  if (stage === "pendahuluan") {
    return (
      <StageCard title={label!}>
        <p className="leading-relaxed">{meeting.pendahuluan}</p>
      </StageCard>
    );
  }
  if (stage === "reading") {
    return (
      <StageCard title={label!}>
        <div className="prose prose-sm max-w-none leading-relaxed">
          <p>{meeting.reading}</p>
        </div>
      </StageCard>
    );
  }
  if (stage === "discussion") {
    return (
      <StageCard title={label!}>
        <p className="mb-3 text-sm text-muted-foreground">
          Diskusikan pertanyaan berikut bersama kelompokmu:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          {meeting.discussion.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </StageCard>
    );
  }
  if (stage === "writing") {
    return (
      <StageCard title={label!}>
        <p className="mb-3">{meeting.writing}</p>
        <Textarea placeholder="Tulis ringkasan dan peta konsepmu di sini…" rows={8} />
        <Button className="mt-3">Simpan LKPD</Button>
      </StageCard>
    );
  }
  if (stage === "presentation") {
    return (
      <StageCard title={label!}>
        <p>{meeting.presentation}</p>
      </StageCard>
    );
  }
  if (stage === "reflection") {
    return (
      <StageCard title={label!}>
        <div className="space-y-3">
          {meeting.reflection.map((q, i) => (
            <div key={i}>
              <div className="mb-1 text-sm font-medium">{q}</div>
              <Textarea rows={3} placeholder="Refleksimu…" />
            </div>
          ))}
        </div>
        <Button className="mt-3">Kirim Refleksi</Button>
      </StageCard>
    );
  }
  if (stage === "quiz") {
    return <QuizStage meeting={meeting} />;
  }
  return null;
}

function StageCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function QuizStage({ meeting }: { meeting: Meeting }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = meeting.quiz.reduce(
    (acc, q, i) => (answers[i] === q.answerIndex ? acc + 1 : acc),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {meeting.quiz.map((q, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="mb-2 font-medium">{q.question}</div>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[i] === oi;
                const correct = submitted && oi === q.answerIndex;
                const wrong = submitted && chosen && oi !== q.answerIndex;
                return (
                  <button
                    key={oi}
                    onClick={() => !submitted && setAnswers({ ...answers, [i]: oi })}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      correct
                        ? "border-green-500 bg-green-500/10"
                        : wrong
                          ? "border-destructive bg-destructive/10"
                          : chosen
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {submitted ? (
          <div className="rounded-md bg-primary/10 p-4 text-sm">
            Skormu: <span className="font-bold">{score}</span> / {meeting.quiz.length}
          </div>
        ) : (
          <Button onClick={() => setSubmitted(true)}>Kumpulkan</Button>
        )}
      </CardContent>
    </Card>
  );
}
