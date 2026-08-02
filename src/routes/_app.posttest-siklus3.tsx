import { createFileRoute } from "@tanstack/react-router";
import { requireSiswa } from "@/lib/route-guards";
import { fetchQuestions, fetchMyAttempt } from "@/features/tests/testsApi";
import { TestTaker } from "@/features/tests/TestTaker";

export const Route = createFileRoute("/_app/posttest-siklus3")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const [questions, attempt] = await Promise.all([
      fetchQuestions("posttest_siklus_3"),
      fetchMyAttempt("posttest_siklus_3"),
    ]);
    return { questions, attempt };
  },
  component: () => {
    const { questions, attempt } = Route.useLoaderData();
    return (
      <TestTaker
        title="Posttest Siklus 3"
        description="Ukur pemahaman kamu setelah menyelesaikan siklus 3 pembelajaran."
        testType="posttest_siklus_3"
        questions={questions}
        existingAttempt={attempt}
      />
    );
  },
});