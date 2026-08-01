import { createFileRoute } from "@tanstack/react-router";
import { TestPlaceholder } from "@/features/tests/TestPlaceholder";
import { requireSiswa } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/pretest")({
  beforeLoad: requireSiswa,
  component: () => (
    <TestPlaceholder
      title="Pretest"
      description="Uji pemahaman awalmu sebelum memulai rangkaian pembelajaran CIRC."
    />
  ),
});