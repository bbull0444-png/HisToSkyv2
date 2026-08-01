import { createFileRoute } from "@tanstack/react-router";
import { TestPlaceholder } from "@/features/tests/TestPlaceholder";
import { requireSiswa } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/posttest")({
  beforeLoad: requireSiswa,
  component: () => (
    <TestPlaceholder
      title="Posttest"
      description="Ukur pemahaman akhirmu setelah menyelesaikan seluruh pertemuan."
    />
  ),
});