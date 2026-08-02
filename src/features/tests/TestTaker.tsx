import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileQuestion, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getStoredUser } from "@/features/auth/AuthContext";
import {
  fetchQuestions,
  fetchMyAttempt,
  submitAttempt,
  type TestAttempt,
  type TestQuestion,
  type TestType,
} from "@/features/tests/testsApi";
import { fetchMeetings } from "@/features/meetings/meetingsApi";
import { fetchProgressMap } from "@/features/meetings/progress";

/**
 * Random generator deterministik (mulberry32) dari sebuah seed angka —
 * dipakai supaya urutan soal & opsi teracak BEDA per siswa, tapi urutan
 * yang sama tetap konsisten kalau siswa yang sama refresh halaman
 * (bukan acak ulang tiap render, yang bakal bikin bingung).
 */
function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let s = seed;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface DisplayQuestion extends TestQuestion {
  /** Urutan tampil opsi, isinya index ASLI ke array `options` — dipakai
   * biar penilaian tetap akurat walau urutan tampilnya diacak. */
  displayOptionOrder: number[];
}

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
  unlockAfterMeetingOrder,
}: {
  title: string;
  description: string;
  testType: TestType;
  /**
   * Kalau diisi: test ini terkunci sampai siswa menyelesaikan pertemuan
   * ke-N (1-indexed, berdasarkan URUTAN pertemuan, bukan ID tetap — jadi
   * tetap benar walau guru pernah hapus/reorder pertemuan). Contoh:
   * Posttest Siklus 1 -> unlockAfterMeetingOrder={1} (butuh Pertemuan 1
   * selesai), Siklus 2 -> {2}, dst. Kalau tidak diisi (mis. Pretest),
   * test selalu terbuka.
   */
  unlockAfterMeetingOrder?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requiredMeetingTitle, setRequiredMeetingTitle] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchQuestions(testType),
      fetchMyAttempt(testType),
      unlockAfterMeetingOrder ? fetchMeetings() : Promise.resolve(null),
      unlockAfterMeetingOrder ? fetchProgressMap() : Promise.resolve(null),
    ]).then(([qs, a, meetings, progressMap]) => {
      if (cancelled) return;
      setQuestions(qs);
      setAttempt(a);

      if (unlockAfterMeetingOrder && meetings && progressMap) {
        // Pertemuan ke-N berdasarkan urutan (meeting_order ascending),
        // BUKAN id tetap — tetap benar walau ada pertemuan yang dihapus.
        const requiredMeeting = meetings[unlockAfterMeetingOrder - 1];
        if (requiredMeeting) {
          const isCompleted = progressMap[requiredMeeting.id] === "completed";
          setLocked(!isCompleted);
          setRequiredMeetingTitle(requiredMeeting.title);
        } else {
          // Pertemuan yang dibutuhkan belum ada/belum dibuat guru -> aman
          // dikunci, daripada siswa nyasar ngerjain test tanpa materi.
          setLocked(true);
          setRequiredMeetingTitle(`Pertemuan ${unlockAfterMeetingOrder}`);
        }
      }

      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [testType, unlockAfterMeetingOrder]);

  // Acak urutan soal + urutan opsi jawaban, seed dari (id siswa + jenis
  // test) supaya tiap siswa dapat urutan beda, tapi urutan itu tetap SAMA
  // kalau dia refresh/buka lagi halaman ini (bukan acak ulang tiap render).
  // Nomor soal & posisi jawaban di answers tetap pakai id/index ASLI dari
  // DB, jadi penilaian di submitAttempt tidak terpengaruh sama sekali.
  const orderedQuestions = useMemo<DisplayQuestion[]>(() => {
    if (questions.length === 0) return [];
    const studentId = getStoredUser()?.id ?? "anon";
    const baseSeed = seedFromString(`${studentId}:${testType}`);

    const questionRand = mulberry32(baseSeed);
    const shuffledQuestions = seededShuffle(questions, questionRand);

    return shuffledQuestions.map((q) => {
      const optionRand = mulberry32(seedFromString(`${studentId}:${testType}:${q.id}`));
      const displayOptionOrder = seededShuffle(
        q.options.map((_, idx) => idx),
        optionRand
      );
      return { ...q, displayOptionOrder };
    });
  }, [questions, testType]);

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

  if (locked) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-5 w-5 text-muted-foreground" /> Belum bisa dikerjakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Selesaikan <strong>{requiredMeetingTitle}</strong> terlebih dahulu (sampai tombol
              "Tandai Selesai" di halaman materi) sebelum bisa mengerjakan {title.toLowerCase()}.
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
        {orderedQuestions.map((q, idx) => (
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
                {q.displayOptionOrder.map((originalIdx, displayIdx) => (
                  <div key={originalIdx} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(originalIdx)} id={`q${q.id}-${originalIdx}`} />
                    <Label htmlFor={`q${q.id}-${originalIdx}`} className="cursor-pointer font-normal">
                      <span className="mr-1 text-muted-foreground">
                        {String.fromCharCode(65 + displayIdx)}.
                      </span>
                      {q.options[originalIdx]}
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
            : `Jawab semua soal dulu (${answeredCount}/${orderedQuestions.length})`}
      </Button>
    </div>
  );
}