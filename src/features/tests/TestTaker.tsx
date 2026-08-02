import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  submitAttempt,
  type TestAttempt,
  type TestQuestion,
  type TestType,
} from "@/features/tests/testsApi";

export function TestTaker({
  title,
  description,
  testType,
  questions,
  existingAttempt,
}: {
  title: string;
  description: string;
  testType: TestType;
  questions: TestQuestion[];
  existingAttempt: TestAttempt | null;
}) {
  const [attempt, setAttempt] = useState(existingAttempt);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

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
