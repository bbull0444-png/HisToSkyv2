import { createFileRoute } from "@tanstack/react-router";
import { requireSiswa } from "@/lib/route-guards";
import { TestTaker } from "@/features/tests/TestTaker";

// Tanpa `loader`: lihat catatan di _app.pretest.tsx dan TestTaker.tsx.
export const Route = createFileRoute("/_app/posttest-siklus2")({
  beforeLoad: requireSiswa,
  component: () => (
    <TestTaker
      title="Posttest Siklus 2"
      description="Ukur pemahaman kamu setelah menyelesaikan siklus 2 pembelajaran."
      testType="posttest_siklus_2"
      unlockAfterMeetingOrder={2}
    />
  ),
});
