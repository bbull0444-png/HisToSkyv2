import { createFileRoute, Link, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  PartyPopper,
  Eye,
  Loader2,
  Save,
  Trash2,
  Presentation,
  Download,
  Upload,
  RefreshCw,
  Lock,
  HelpCircle,
  Heart,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchMeetingById, fetchMeetings } from "@/features/meetings/meetingsApi";
import { STAGES, type LearningStage } from "@/features/meetings/types";
import { fetchMateriKonten, type MateriKontenMap } from "@/lib/materi-konten";
import {
  fetchProgressMap,
  getMeetingProgressStatusIn,
  isMeetingUnlockedIn,
  markMeetingCompleted,
  markMeetingOpened,
} from "@/features/meetings/progress";
import "@/components/editor/editor.css";
import { getStoredUser } from "@/features/auth/AuthContext";
import {
  deleteMyResponse,
  fetchMyGroupId,
  fetchMyResponses,
  saveMyResponse,
} from "@/features/responses/studentResponses";
import MyGroupCard from "@/components/kelompok/MyGroupCard";
import { getGroups } from "@/lib/kelompok";
import { supabase } from "@/lib/supabase";
import {
  fetchMyGroupContext,
  fetchGroupProducts,
  uploadOrReplaceGroupProduct,
  fetchMyQuestion,
  saveMyQuestion,
  deleteMyQuestion,
  fetchMyAppreciation,
  saveMyAppreciation,
  deleteMyAppreciation,
  fetchSelectedQuestion,
  fetchSelectedAppreciation,
  type GroupProductWithGroup,
  type PresentationQuestionWithRelations,
  type PresentationAppreciationWithRelations,
} from "@/features/presentasi/presentasi";

export const Route = createFileRoute("/_app/materi/$id")({
  // Halaman ini sekarang dipakai DUA role: siswa ngerjain beneran, dan
  // guru preview lewat tombol "Lihat" di Kelola Materi. Jadi guard-nya
  // cuma "harus login" (bukan requireSiswa lagi) — pembedaan perilaku per
  // role dilakukan di loader & komponen di bawah.
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/login" });
  },
  loader: async ({ params }) => {
    const meetingId = Number(params.id);
    const meeting = await fetchMeetingById(meetingId);
    if (!meeting) throw notFound();

    const isGuru = getStoredUser()?.role === "guru";

    const [allMeetings, progressMap] = await Promise.all([fetchMeetings(), fetchProgressMap()]);
    const orderedIds = allMeetings
      .filter((m) => m.status === "published")
      .map((m) => m.id);

    // Guru preview: boleh liat pertemuan draft & yang belum "kebuka" secara
    // urutan (dia kan yang ngatur urutannya, wajar liat semua). Gate di
    // bawah ini cuma berlaku buat siswa.
    if (!isGuru) {
      // Guru menandai pertemuan ini draft -> siswa tidak boleh akses sama
      // sekali, terlepas dari status progres pertemuan sebelumnya.
      if (meeting.status !== "published") {
        throw redirect({ to: "/materi" });
      }

      // Siswa yang mengakses URL pertemuan terkunci langsung (belum
      // menyelesaikan pertemuan sebelumnya) dikembalikan ke daftar materi.
      if (!isMeetingUnlockedIn(orderedIds, progressMap, meetingId)) {
        throw redirect({ to: "/materi" });
      }
    }

    const content = await fetchMateriKonten(meetingId);
    const alreadyCompleted =
      !isGuru && getMeetingProgressStatusIn(orderedIds, progressMap, meetingId) === "completed";

    return { meeting, content, alreadyCompleted, isGuru };
  },
  component: MateriDetail,
  notFoundComponent: () => {
    const isGuru = getStoredUser()?.role === "guru";
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Pertemuan tidak ditemukan.</p>
        <Button asChild className="mt-4">
          <Link to={isGuru ? "/kelola-materi" : "/materi"}>Kembali</Link>
        </Button>
      </div>
    );
  },
});

function MateriDetail() {
  const { meeting, content, alreadyCompleted, isGuru } = Route.useLoaderData();
  const navigate = useNavigate();
  const [stage, setStage] = useState<LearningStage>(STAGES[0].key);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [saving, setSaving] = useState(false);
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const isLastStage = currentIdx === STAGES.length - 1;
  const progress = ((currentIdx + 1) / STAGES.length) * 100;

  useEffect(() => {
    // Guru cuma preview, jangan nandain progres siapa-siapa.
    if (isGuru) return;
    markMeetingOpened(meeting.id);
  }, [meeting.id, isGuru]);

  const goNext = () => {
    if (currentIdx < STAGES.length - 1) setStage(STAGES[currentIdx + 1].key);
  };
  const goPrev = () => {
    if (currentIdx > 0) setStage(STAGES[currentIdx - 1].key);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await markMeetingCompleted(meeting.id);
      setCompleted(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to={isGuru ? "/kelola-materi" : "/materi"}>
              <ArrowLeft className="mr-1 h-4 w-4" /> {isGuru ? "Kelola Materi" : "Semua Pertemuan"}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Pertemuan {meeting.order}
            </div>
            {isGuru && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <Eye className="h-3 w-3" />
                Mode Preview
              </span>
            )}
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

      <StageContent
        stage={stage}
        content={content}
        isGuru={isGuru}
        meetingId={meeting.id}
        presentationLocked={meeting.presentationLocked}
      />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={currentIdx === 0}>
          Sebelumnya
        </Button>
        <div className="text-xs text-muted-foreground">
          Tahap {currentIdx + 1} dari {STAGES.length}
        </div>
        {isLastStage ? (
          isGuru ? (
            <Button disabled variant="outline" className="gap-1.5">
              <Eye className="h-4 w-4" />
              Preview Guru
            </Button>
          ) : completed ? (
            <Button disabled className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Pertemuan Selesai
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={saving} className="gap-1.5">
              <PartyPopper className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Tandai Selesai"}
            </Button>
          )
        ) : (
          <Button onClick={goNext}>Selanjutnya</Button>
        )}
      </div>

      {!isGuru && isLastStage && completed && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          Pertemuan {meeting.order} sudah kamu selesaikan. Pertemuan berikutnya sekarang terbuka.{" "}
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
  isGuru,
  meetingId,
  presentationLocked,
}: {
  stage: LearningStage;
  content: MateriKontenMap;
  isGuru: boolean;
  meetingId: number;
  presentationLocked: boolean;
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

        {stage === "pembentukanKelompok" && !isGuru && (
          <div className="mt-6">
            <MyGroupCard />
          </div>
        )}

        {stage === "menulisTanggapan" && !isGuru && (
          <div className="mt-6">
            <StudentResponseForm meetingId={meetingId} />
          </div>
        )}

        {stage === "presentasi" && !isGuru && (
          <div className="mt-6">
            <PresentationStage meetingId={meetingId} locked={presentationLocked} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StudentResponseForm({ meetingId }: { meetingId: number }) {
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [gid, responseMap] = await Promise.all([fetchMyGroupId(), fetchMyResponses()]);
      if (cancelled) return;
      setGroupId(gid);
      const existing = responseMap[meetingId];
      if (existing) {
        setResponse(existing.response);
        setHasSaved(true);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  const handleSave = async () => {
    if (!response.trim() || groupId === null) return;
    setSaving(true);
    try {
      await saveMyResponse(meetingId, groupId, response.trim());
      setHasSaved(true);
      toast.success("Tanggapan berhasil disimpan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan tanggapan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMyResponse(meetingId);
      setResponse("");
      setHasSaved(false);
      setConfirmOpen(false);
      toast.success("Tanggapan dihapus, silakan tulis ulang");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus tanggapan");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat tanggapan...
      </p>
    );
  }

  if (groupId === null) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Kamu belum tergabung dalam kelompok mana pun. Ikuti tahap Pembentukan Kelompok Belajar
        terlebih dahulu untuk menulis tanggapan.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 text-sm font-medium">Tulis Tanggapan</div>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Tulis tanggapanmu di sini..."
          rows={6}
          disabled={hasSaved}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {hasSaved && (
            <span className="flex items-center gap-1 text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tanggapan berhasil disimpan
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {hasSaved ? (
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={deleting} className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Menghapus..." : "Hapus & Tulis Ulang"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus tanggapan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tanggapanmu akan dihapus dari penyimpanan. Kamu bisa menulis ulang dari awal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !response.trim()}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Menyimpan..." : "Simpan Tanggapan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presentasi Hasil Kelompok (diferensiasi produk)
// ---------------------------------------------------------------------------

function PresentationStage({ meetingId, locked }: { meetingId: number; locked: boolean }) {
  const [groups, setGroups] = useState<{ id: number; group_name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    getGroups()
      .then((data) => {
        if (!cancelled) setGroups(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {locked && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="h-4 w-4 shrink-0" />
          Sesi presentasi sudah dimulai guru. Pertanyaan &amp; apresiasi tidak bisa lagi diubah.
        </div>
      )}

      <GroupProductSection meetingId={meetingId} />

      <SelectedQuestionBanner meetingId={meetingId} />

      <SelectedAppreciationBanner meetingId={meetingId} />

      <PresentationFeedbackSection
        meetingId={meetingId}
        locked={locked}
        groups={groups}
        kind="pertanyaan"
      />
      <PresentationFeedbackSection
        meetingId={meetingId}
        locked={locked}
        groups={groups}
        kind="apresiasi"
      />
    </div>
  );
}

function SelectedQuestionBanner({ meetingId }: { meetingId: number }) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<PresentationQuestionWithRelations | null>(null);

  const load = async () => {
    const q = await fetchSelectedQuestion(meetingId);
    setQuestion(q);
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Live-update: begitu guru mengganti pertanyaan terpilih di halaman
    // Moderasi Presentasi, banner ini otomatis ikut berubah tanpa reload.
    const channel = supabase
      .channel(`selected-question-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presentation_questions",
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  if (loading) return null;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Pertanyaan Terpilih Guru</CardTitle>
      </CardHeader>
      <CardContent>
        {question ? (
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium">{question.student_name}</span>
              <Badge variant="outline">untuk {question.target_group_name}</Badge>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{question.question}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Guru belum memilih pertanyaan.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SelectedAppreciationBanner({ meetingId }: { meetingId: number }) {
  const [loading, setLoading] = useState(true);
  const [appreciation, setAppreciation] = useState<PresentationAppreciationWithRelations | null>(null);

  const load = async () => {
    const a = await fetchSelectedAppreciation(meetingId);
    setAppreciation(a);
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Live-update: begitu guru mengganti apresiasi terpilih di halaman
    // Moderasi Presentasi, banner ini otomatis ikut berubah tanpa reload.
    const channel = supabase
      .channel(`selected-appreciation-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presentation_appreciations",
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  if (loading) return null;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Apresiasi Terpilih Guru</CardTitle>
      </CardHeader>
      <CardContent>
        {appreciation ? (
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium">{appreciation.student_name}</span>
              <Badge variant="outline">untuk {appreciation.target_group_name}</Badge>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{appreciation.message}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Guru belum memilih apresiasi.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ProductPreview({
  product,
}: {
  product: { file_url: string; file_type: string; file_name: string };
}) {
  if (product.file_type === "pdf") {
    return (
      <iframe
        src={product.file_url}
        title={product.file_name}
        className="h-64 w-full rounded-md border"
      />
    );
  }

  if (product.file_type === "png" || product.file_type === "jpg") {
    return (
      <img
        src={product.file_url}
        alt={product.file_name}
        className="max-h-64 w-full rounded-md border object-contain"
      />
    );
  }

  // PPT/PPTX: tidak ada preview inline, cukup ikon + tautan unduh.
  return (
    <a
      href={product.file_url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
    >
      <Presentation className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate">{product.file_name}</span>
      <Download className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function GroupProductSection({ meetingId }: { meetingId: number }) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [groupContext, setGroupContext] = useState<{ groupId: number; isLeader: boolean } | null>(
    null,
  );
  const [products, setProducts] = useState<GroupProductWithGroup[]>([]);

  const load = async () => {
    const [context, list] = await Promise.all([fetchMyGroupContext(), fetchGroupProducts(meetingId)]);
    setGroupContext(context);
    setProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  useEffect(() => {
    // Live-update: begitu ketua kelompok mana pun (termasuk kelompok lain)
    // mengunggah/menghapus produk, daftar ini otomatis ikut berubah tanpa
    // reload -- pola sama dengan banner "pertanyaan terpilih" di bawah.
    const channel = supabase
      .channel(`group-products-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_products",
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const myProduct = groupContext
    ? (products.find((p) => p.group_id === groupContext.groupId) ?? null)
    : null;
  const otherProducts = groupContext
    ? products.filter((p) => p.group_id !== groupContext.groupId)
    : products;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !groupContext) return;

    setUploading(true);
    try {
      await uploadOrReplaceGroupProduct(meetingId, groupContext.groupId, file);
      toast.success("Produk kelompok berhasil diunggah");
      await load();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah produk kelompok");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat produk kelompok...
      </p>
    );
  }

  if (!groupContext) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Kamu belum tergabung dalam kelompok mana pun. Ikuti tahap Pembentukan Kelompok Belajar
        terlebih dahulu untuk mengakses produk kelompok.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produk Kelompok Anda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myProduct ? (
            <ProductPreview product={myProduct} />
          ) : (
            <p className="text-sm text-muted-foreground">Kelompokmu belum mengunggah produk.</p>
          )}

          {groupContext.isLeader ? (
            <div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : myProduct ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? "Mengunggah..." : myProduct ? "Ganti Produk" : "Unggah Produk"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/png,image/jpeg"
                  disabled={uploading}
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Format PDF, PPT/PPTX, PNG, atau JPG. Maksimal 20MB. Mengunggah file baru akan
                mengganti produk kelompok yang lama.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Hanya ketua kelompok yang bisa mengunggah/mengganti produk kelompok.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Galeri Produk Kelompok Lain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {otherProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada kelompok lain yang mengunggah produk.
            </p>
          ) : (
            otherProducts.map((p) => (
              <div key={p.id} className="space-y-2 rounded-lg border p-3">
                <div className="text-sm font-medium">{p.group_name}</div>
                <ProductPreview product={p} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PresentationFeedbackSection({
  meetingId,
  locked,
  groups,
  kind,
}: {
  meetingId: number;
  locked: boolean;
  groups: { id: number; group_name: string }[];
  kind: "pertanyaan" | "apresiasi";
}) {
  const isQuestion = kind === "pertanyaan";
  const label = isQuestion ? "Pertanyaan" : "Apresiasi";
  const Icon = isQuestion ? HelpCircle : Heart;

  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedGroupName, setSavedGroupName] = useState("");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = isQuestion ? await fetchMyQuestion(meetingId) : await fetchMyAppreciation(meetingId);
      if (cancelled) return;
      if (existing) {
        const gid = existing.target_group_id;
        const value = isQuestion ? (existing as { question: string }).question : (existing as { message: string }).message;
        setTargetGroupId(String(gid));
        setText(value);
        setSavedGroupName(groups.find((g) => g.id === gid)?.group_name ?? "Kelompok");
        setSubmitted(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, kind, groups.length]);

  const handleSave = async () => {
    if (!targetGroupId || !text.trim()) return;
    setSaving(true);
    try {
      if (isQuestion) {
        await saveMyQuestion(meetingId, Number(targetGroupId), text.trim());
      } else {
        await saveMyAppreciation(meetingId, Number(targetGroupId), text.trim());
      }
      setSavedGroupName(groups.find((g) => g.id === Number(targetGroupId))?.group_name ?? "Kelompok");
      setSubmitted(true);
      setEditing(false);
      toast.success(`${label} berhasil dikirim`);
    } catch (err) {
      console.error(err);
      toast.error(`Gagal mengirim ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      if (isQuestion) {
        await deleteMyQuestion(meetingId);
      } else {
        await deleteMyAppreciation(meetingId);
      }
      setSubmitted(false);
      setEditing(false);
      setText("");
      setTargetGroupId("");
      toast.success(`${label} dihapus, silakan kirim ulang`);
    } catch (err) {
      console.error(err);
      toast.error(`Gagal menghapus ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const cardTitle = isQuestion ? "Pertanyaan untuk Kelompok Lain" : "Apresiasi untuk Kelompok Lain";

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat {label.toLowerCase()}...
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {submitted && !editing ? (
          <div className="space-y-2">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Ditujukan ke: {savedGroupName}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
            </div>
            {!locked && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={saving} className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus {label.toLowerCase()}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {label} ini akan dihapus. Kamu bisa menulis ulang selama sesi presentasi
                        belum dikunci guru.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ) : locked ? (
          <p className="text-sm text-muted-foreground">
            Sesi presentasi sudah dikunci guru. Kamu tidak sempat mengirim {label.toLowerCase()}.
          </p>
        ) : (
          <div className="space-y-3">
            <Select value={targetGroupId} onValueChange={setTargetGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelompok tujuan" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isQuestion ? "Tulis satu pertanyaan untuk kelompok terkait..." : "Tulis satu apresiasi untuk kelompok terkait..."
              }
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !targetGroupId || !text.trim()}
                className="gap-1.5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Mengirim..." : `Kirim ${label}`}
              </Button>
              {submitted && (
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Batal
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
