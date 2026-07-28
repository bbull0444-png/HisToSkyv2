import { createFileRoute } from "@tanstack/react-router";
import { TestPlaceholder } from "@/features/tests/TestPlaceholder";

export const Route = createFileRoute("/_app/posttest")({
  component: () => (
    <TestPlaceholder
      title="Posttest"
      description="Ukur pemahaman akhirmu setelah menyelesaikan seluruh pertemuan."
    />
  ),
});
