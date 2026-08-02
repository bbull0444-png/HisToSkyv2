import { createFileRoute } from "@tanstack/react-router";
import { requireSiswa } from "@/lib/route-guards";
import { fetchQuestions, fetchMyAttempt } from "@/features/tests/testsApi";
import { TestTaker } from "@/features/tests/TestTaker";

export const Route = createFileRoute("/_app/posttest")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const [questions, attempt] = await Promise.all([
      fetchQuestions("posttest"),
      fetchMyAttempt("posttest"),
    ]);
    return { questions, attempt };
  },
  component: () => {
    const { questions, attempt } = Route.useLoaderData();
    return (
      <TestTaker
        title="Posttest"
        description="Ukur pemahaman akhirmu setelah menyelesaikan seluruh pertemuan."
        testType="posttest"
        questions={questions}
        existingAttempt={attempt}
      />
    );
  },
});