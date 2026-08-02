import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Check, Upload, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  fetchQuestions,
  parseBulkQuestions,
  bulkCreateQuestions,
  type TestQuestion,
  type TestType,
  type BulkParseResult,
} from "@/features/tests/testsApi";

const EMPTY_OPTIONS = ["", "", "", "", ""];

export function KelolaTestPage({ title, testType }: { title: string; testType: TestType }) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(EMPTY_OPTIONS);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<BulkParseResult | null>(null);
  const [importing, setImporting] = useState(false);

  // Fetch di dalam komponen (bukan loader) supaya bisa dipakai ulang oleh
  // dua route (kelola-pretest & kelola-posttest) tanpa duplikasi loader.
  useEffect(() => {
    fetchQuestions(testType).then((qs) => {
      setQuestions(qs);
      setLoaded(true);
    });
  }, [testType]);

  const resetForm = () => {
    setEditingId(null);
    setQuestionText("");
    setOptions([...EMPTY_OPTIONS]);
    setCorrectIndex(0);
    setFormOpen(false);
  };

  const startEdit = (q: TestQuestion) => {
    setEditingId(q.id);
    setQuestionText(q.question_text);
    setOptions([...q.options]);
    setCorrectIndex(q.correct_index);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!questionText.trim() || options.some((o) => !o.trim())) {
      toast.error("Isi pertanyaan dan semua pilihan jawaban dulu");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateQuestion(editingId, questionText.trim(), options, correctIndex);
        toast.success("Soal diperbarui");
      } else {
        await createQuestion(testType, questionText.trim(), options, correctIndex);
        toast.success("Soal ditambahkan");
      }
      const refreshed = await fetchQuestions(testType);
      setQuestions(refreshed);
      resetForm();
    } catch {
      toast.error("Gagal menyimpan soal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Soal dihapus");
    } finally {
      setDeletingId(null);
    }
  };

  const resetImport = () => {
    setImportText("");
    setImportPreview(null);
    setImportOpen(false);
  };

  const handlePreviewImport = () => {
    if (!importText.trim()) {
      toast.error("Paste teks soal dulu");
      return;
    }
    setImportPreview(parseBulkQuestions(importText));
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.questions.length === 0) return;
    setImporting(true);
    try {
      const count = await bulkCreateQuestions(testType, importPreview.questions);
      const refreshed = await fetchQuestions(testType);
      setQuestions(refreshed);
      toast.success(`${count} soal berhasil diimport`);
      resetImport();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal import soal");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kelola {title}</h1>
          <p className="text-sm text-muted-foreground">
            Susun soal pilihan ganda. Siswa mengerjakan sekali, dinilai otomatis.
          </p>
        </div>
        {!formOpen && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5">
              <Upload className="h-4 w-4" />
              Import Soal
            </Button>
            <Button onClick={() => setFormOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Soal
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          if (!open) resetImport();
          else setImportOpen(true);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Soal {title}</DialogTitle>
            <DialogDescription>
              Paste banyak soal sekaligus, format per soal:
            </DialogDescription>
          </DialogHeader>

          <pre className="rounded-md bg-muted p-3 text-xs leading-relaxed">
{`1. Pertanyaan di sini?
A. Opsi A
B. Opsi B
C. Opsi C
D. Opsi D
E. Opsi E
JAWABAN: C`}
          </pre>

          <Textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportPreview(null);
            }}
            placeholder="Paste teks soal di sini..."
            rows={10}
            className="font-mono text-xs"
          />

          {!importPreview && (
            <Button onClick={handlePreviewImport} variant="outline" className="w-full">
              Preview
            </Button>
          )}

          {importPreview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{importPreview.questions.length} soal terbaca</Badge>
                {importPreview.errors.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {importPreview.errors.length} dilewati
                  </Badge>
                )}
              </div>

              {importPreview.errors.length > 0 && (
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                  {importPreview.errors.map((e, i) => (
                    <p key={i}>{e}</p>
                  ))}
                </div>
              )}

              {importPreview.questions.length > 0 && (
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {importPreview.questions.map((q, i) => (
                    <div key={i} className="rounded-md border p-2 text-xs">
                      <p className="font-medium">
                        {i + 1}. {q.question_text}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-muted-foreground">
                        {q.options.map((opt, optIdx) => (
                          <li
                            key={optIdx}
                            className={optIdx === q.correct_index ? "font-medium text-primary" : ""}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                            {optIdx === q.correct_index ? " ✓" : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportPreview(null)}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit teks
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetImport}>
              Batal
            </Button>
            {importPreview && importPreview.questions.length > 0 && (
              <Button onClick={handleConfirmImport} disabled={importing} className="gap-1.5">
                <Upload className="h-4 w-4" />
                {importing ? "Mengimport..." : `Import ${importPreview.questions.length} Soal`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? "Edit Soal" : "Soal Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pertanyaan</Label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Tulis pertanyaan di sini..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Pilihan Jawaban (pilih radio di jawaban yang benar)</Label>
              <RadioGroup
                value={String(correctIndex)}
                onValueChange={(v) => setCorrectIndex(Number(v))}
                className="space-y-2"
              >
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <RadioGroupItem value={String(idx)} id={`opt-${idx}`} />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                <Check className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="gap-1.5">
                <X className="h-4 w-4" />
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loaded && questions.length === 0 && !formOpen && (
          <p className="text-sm text-muted-foreground">
            Belum ada soal {title.toLowerCase()}. Klik "Tambah Soal" untuk mulai.
          </p>
        )}
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">
                  {idx + 1}. {q.question_text}
                </p>
                <div className="flex flex-shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(q)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        disabled={deletingId === q.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak bisa dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(q.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {q.options.map((opt, optIdx) => (
                  <li
                    key={optIdx}
                    className={optIdx === q.correct_index ? "font-medium text-primary" : ""}
                  >
                    {optIdx === q.correct_index ? "✓ " : "· "}
                    {opt}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}