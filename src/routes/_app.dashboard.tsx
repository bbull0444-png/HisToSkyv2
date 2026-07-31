import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  TrendingUp,
  Users,
  FileQuestion,
  Trophy,
  ClipboardList,
  MessageSquareHeart,
  FolderKanban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { MEETINGS } from "@/features/meetings/data";
import { fetchProgressMap, getOverallProgressIn } from "@/features/meetings/progress";

export const Route = createFileRoute("/_app/dashboard")({
  loader: async () => {
    const progressMap = await fetchProgressMap();
    return { progressMap };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  return user?.role === "guru" ? <TeacherDashboard /> : <StudentDashboard />;
}

function StatCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const { progressMap } = Route.useLoaderData();
  const { completed, total } = getOverallProgressIn(progressMap);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 p-6 text-primary-foreground shadow-lg">
        <div className="text-sm opacity-80">Selamat datang kembali,</div>
        <div className="text-2xl font-bold">{user?.name} 👋</div>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          {completed === 0
            ? "Ayo mulai perjalanan belajar sejarahmu dari Pertemuan 1."
            : `Lanjutkan perjalanan belajar sejarahmu. Kamu sudah menyelesaikan ${completed} dari ${total} pertemuan.`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Pertemuan Selesai" value={`${completed}/${total}`} icon={BookOpen} />
        <StatCard title="Progres Belajar" value={`${progressPct}%`} icon={TrendingUp} />
        <StatCard title="Nilai Rata-rata" value="-" icon={Trophy} hint="Belum ada data" />
        <StatCard title="Pretest" value="Belum dikerjakan" icon={FileQuestion} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progres Materi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPct} />
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/materi">Lanjut belajar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/nilai">Lihat nilai</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherDashboard() {
  const published = MEETINGS.filter((m) => m.status === "published").length;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 p-6 text-primary-foreground shadow-lg">
        <div className="text-sm opacity-80">Panel Guru</div>
        <div className="text-2xl font-bold">Ringkasan Kelas Sejarah</div>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Kelola materi CIRC, pantau progres siswa, dan susun laporan penelitianmu.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Siswa" value="41" icon={Users} />
        <StatCard
          title="Materi Publish"
          value={`${published}/${MEETINGS.length}`}
          icon={FolderKanban}
        />
        <StatCard title="Rata-rata Nilai" value="82.4" icon={Trophy} />
        <StatCard title="Refleksi Baru" value="7" icon={MessageSquareHeart} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/kelola-materi">Kelola Materi</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/kelola-lkpd">Kelola LKPD</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/kelola-quiz">Kelola Quiz</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/rekap-nilai">Rekap Nilai</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span>15 siswa menyelesaikan LKPD Pertemuan 3</span>
            </div>
            <div className="flex items-center gap-3">
              <FileQuestion className="h-4 w-4 text-primary" />
              <span>Quiz Pertemuan 2 telah dinilai otomatis</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquareHeart className="h-4 w-4 text-primary" />
              <span>7 refleksi baru menunggu ditinjau</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
