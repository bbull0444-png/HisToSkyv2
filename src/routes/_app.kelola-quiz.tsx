import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, FileQuestion, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MEETINGS } from "@/features/meetings/data";
import type { QuizItem } from "@/features/meetings/types";
import { toast } from "sonner";
import { requireGuru } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/kelola-quiz")({
  beforeLoad: requireGuru,
  component: KelolaQuiz,
});

function KelolaQuiz() {
  const [bank, setBank] = useState<Record<number, QuizItem[]>>(() =>
    Object.fromEntries(
      MEETINGS.map((m) => [m.id, m.quiz.map((q) => ({ ...q, options: [...q.options] }))]),
    ),
  );
  const [openId, setOpenId] = useState<number | null>(null);
  const questions = openId ? bank[openId] : [];

  const updateQ = (idx: number, patch: Partial<QuizItem>) =>
    setBank((prev) => ({
      ...prev,
      [openId!]: prev[openId!].map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    }));

  const updateOption = (idx: number, oi: number, value: string) =>
    setBank((prev) => ({
      ...prev,
      [openId!]: prev[openId!].map((q, i) =>
        i === idx ? { ...q, options: q.options.map((o, k) => (k === oi ? value : o)) } : q,
      ),
    }));

  const addQuestion = () =>
    setBank((prev) => ({
      ...prev,
      [openId!]: [
        ...prev[openId!],
        {
          question: "Pertanyaan baru",
          options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
          answerIndex: 0,
        },
      ],
    }));

  const removeQuestion = (idx: number) =>
    setBank((prev) => ({
      ...prev,
      [openId!]: prev[openId!].filter((_, i) => i !== idx),
    }));

  const save = () => {
    toast.success(`Bank soal Pertemuan ${openId} disimpan (${bank[openId!].length} soal)`);
    setOpenId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Quiz</h1>
        <p className="text-sm text-muted-foreground">
          Kelola bank soal quiz beserta opsi dan kunci jawaban tiap pertemuan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEETINGS.map((m) => {
          const items = bank[m.id];
          return (
            <Card key={m.id}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pertemuan {m.id}
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <FileQuestion className="h-3 w-3" /> Quiz
                  </Badge>
                </div>
                <div className="mt-2 line-clamp-2 font-semibold">{m.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {items.length} soal · pilihan ganda
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button size="sm" onClick={() => setOpenId(m.id)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz Pertemuan {openId}</DialogTitle>
            <DialogDescription>
              Tambah, ubah, atau hapus soal. Pilih opsi sebagai kunci jawaban.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {questions?.map((q, idx) => (
              <div key={idx} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-sm font-semibold">Soal {idx + 1}</Label>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeQuestion(idx)}
                    aria-label="Hapus soal"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  value={q.question}
                  onChange={(e) => updateQ(idx, { question: e.target.value })}
                  placeholder="Tulis pertanyaan"
                />
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={q.answerIndex === oi}
                        onChange={() => updateQ(idx, { answerIndex: oi })}
                        className="h-4 w-4"
                      />
                      <Input value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus className="mr-1 h-4 w-4" /> Tambah Soal
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenId(null)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
