import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileQuestion, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  fetchQuestions,
  fetchMyAttempt,
  submitAttempt,
  type TestAttempt,
  type TestQuestion,
  type TestType,
} from "@/features/tests/testsApi";

/**
 * PENTING: komponen ini SENGAJA mengambil data sendiri lewat useEffect
 * (bukan lewat `loader` route), karena identitas siswa cuma ada di
 * localStorage browser. Kalau datanya diambil lewat `loader`, render
 * pertama sempat terjadi di SERVER (SSR) yang tidak punya akses ke
 * localStorage sama sekali — hasilnya kadang soal/nilai muncul, kadang
 * tidak, tergantung timing. Fetch di useEffect memastikan ini SELALU
 * jalan di browser, konsisten setiap saat.
 */
export function TestTaker({
  title,
  description,
  testType,
}: {
  title: string;
  description: string;
  testType: TestType;
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchQuestions(testType), fetchMyAttempt(testType)]).then(([qs, a]) => {
      if (cancelled) return;
      setQuestions(qs);
      setAttempt(a);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [testType]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat...
        </div>
      </div>
    );
  }

  if (attempt) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Sudah dikerjakan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">{attempt.score}</p>
            <p className="text-sm text-muted-foreground">
              Benar {attempt.correct_count} dari {attempt.total_questions} soal
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Guru belum menyiapkan soal {title.toLowerCase()}. Coba lagi nanti.
        </p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitAttempt(testType, answers);
      if (result) {
        setAttempt(result);
        toast.success(`${title} berhasil dikirim. Skor: ${result.score}`);
      } else {
        toast.error("Gagal mengirim jawaban, coba lagi.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim jawaban.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {answeredCount} dari {questions.length} soal terjawab
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2 text-base font-semibold">
                <FileQuestion className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>
                  {idx + 1}. {q.question_text}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[q.id]?.toString() ?? ""}
                onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))}
                className="space-y-2"
              >
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(optIdx)} id={`q${q.id}-${optIdx}`} />
                    <Label htmlFor={`q${q.id}-${optIdx}`} className="cursor-pointer font-normal">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="w-full">
        {submitting
          ? "Mengirim..."
          : allAnswered
            ? `Kirim ${title}`
            : `Jawab semua soal dulu (${answeredCount}/${questions.length})`}
      </Button>
    </div>
  );
}