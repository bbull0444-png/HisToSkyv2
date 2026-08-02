import { createFileRoute } from "@tanstack/react-router";
import { requireSiswa } from "@/lib/route-guards";
import { fetchQuestions, fetchMyAttempt } from "@/features/tests/testsApi";
import { TestTaker } from "@/features/tests/TestTaker";

export const Route = createFileRoute("/_app/pretest")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const [questions, attempt] = await Promise.all([
      fetchQuestions("pretest"),
      fetchMyAttempt("pretest"),
    ]);
    return { questions, attempt };
  },
  component: () => {
    const { questions, attempt } = Route.useLoaderData();
    return (
      <TestTaker
        title="Pretest"
        description="Uji pemahaman awalmu sebelum memulai rangkaian pembelajaran CIRC."
        testType="pretest"
        questions={questions}
        existingAttempt={attempt}
      />
    );
  },
});