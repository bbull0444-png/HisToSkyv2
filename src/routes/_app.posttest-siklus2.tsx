import { createFileRoute } from "@tanstack/react-router";
import { requireSiswa } from "@/lib/route-guards";
import { fetchQuestions, fetchMyAttempt } from "@/features/tests/testsApi";
import { TestTaker } from "@/features/tests/TestTaker";

export const Route = createFileRoute("/_app/posttest-siklus2")({
  beforeLoad: requireSiswa,
  loader: async () => {
    const [questions, attempt] = await Promise.all([
      fetchQuestions("posttest_siklus_2"),
      fetchMyAttempt("posttest_siklus_2"),
    ]);
    return { questions, attempt };
  },
  component: () => {
    const { questions, attempt } = Route.useLoaderData();
    return (
      <TestTaker
        title="Posttest Siklus 2"
        description="Ukur pemahaman kamu setelah menyelesaikan siklus 2 pembelajaran."
        testType="posttest_siklus_2"
        questions={questions}
        existingAttempt={attempt}
        unlockAfterMeetingOrder={2}
      />
    );
  },
});