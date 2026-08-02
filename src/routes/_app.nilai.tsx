import { createFileRoute } from "@tanstack/react-router";
import { Trophy, TrendingUp, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSiswa } from "@/lib/route-guards";
import { fetchMyAttempt } from "@/features/tests/testsApi";

export const Route = createFileRoute("/_app/nilai")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const [pretest, posttest] = await Promise.all([
      fetchMyAttempt("pretest"),
      fetchMyAttempt("posttest"),
    ]);
    return { pretest, posttest };
  },
  component: NilaiPage,
});

function NilaiPage() {
  const { pretest, posttest } = Route.useLoaderData();
  const peningkatan =
    pretest && posttest ? posttest.score - pretest.score : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nilai Saya</h1>
        <p className="text-sm text-muted-foreground">Hasil pretest dan posttest kamu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileQuestion className="h-4 w-4" /> Pretest
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pretest ? (
              <>
                <p className="text-3xl font-bold">{pretest.score}</p>
                <p className="text-xs text-muted-foreground">
                  Benar {pretest.correct_count} dari {pretest.total_questions}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum dikerjakan</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Trophy className="h-4 w-4" /> Posttest
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posttest ? (
              <>
                <p className="text-3xl font-bold">{posttest.score}</p>
                <p className="text-xs text-muted-foreground">
                  Benar {posttest.correct_count} dari {posttest.total_questions}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum dikerjakan</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Peningkatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {peningkatan !== null ? (
              <p className={`text-3xl font-bold ${peningkatan >= 0 ? "text-primary" : "text-destructive"}`}>
                {peningkatan >= 0 ? "+" : ""}
                {peningkatan}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Kerjakan pretest & posttest dulu
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}