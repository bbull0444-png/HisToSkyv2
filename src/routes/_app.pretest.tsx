import { createFileRoute } from "@tanstack/react-router";
import { TestPlaceholder } from "@/features/tests/TestPlaceholder";

export const Route = createFileRoute("/_app/pretest")({
  component: () => (
    <TestPlaceholder
      title="Pretest"
      description="Uji pemahaman awalmu sebelum memulai rangkaian pembelajaran CIRC."
    />
  ),
});
