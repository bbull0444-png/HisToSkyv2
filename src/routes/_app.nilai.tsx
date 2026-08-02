import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSiswa } from "@/lib/route-guards";
import { fetchMyAttempt, TEST_TYPES, type TestAttempt, type TestType } from "@/features/tests/testsApi";

export const Route = createFileRoute("/_app/nilai")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const entries = await Promise.all(
      TEST_TYPES.map(async (t) => [t.type, await fetchMyAttempt(t.type)] as const)
    );
    const attempts = Object.fromEntries(entries) as Record<TestType, TestAttempt | null>;
    return { attempts };
  },
  component: NilaiPage,
});

function NilaiPage() {
  const { attempts } = Route.useLoaderData();
  const pretest = attempts.pretest;
  const lastPosttest =
    attempts.posttest_siklus_3 ?? attempts.posttest_siklus_2 ?? attempts.posttest_siklus_1;
  const peningkatan = pretest && lastPosttest ? lastPosttest.score - pretest.score : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nilai Saya</h1>
        <p className="text-sm text-muted-foreground">
          Hasil pretest dan posttest tiap siklus pembelajaran.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEST_TYPES.map((t) => (
          <Card key={t.type}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileQuestion className="h-4 w-4" /> {t.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attempts[t.type] ? (
                <>
                  <p className="text-3xl font-bold">{attempts[t.type]!.score}</p>
                  <p className="text-xs text-muted-foreground">
                    Benar {attempts[t.type]!.correct_count} dari {attempts[t.type]!.total_questions}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Belum dikerjakan</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-xs">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Peningkatan (Pretest → Posttest Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {peningkatan !== null ? (
            <p className={`text-3xl font-bold ${peningkatan >= 0 ? "text-primary" : "text-destructive"}`}>
              {peningkatan >= 0 ? "+" : ""}
              {peningkatan}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Kerjakan pretest & minimal satu posttest dulu</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}