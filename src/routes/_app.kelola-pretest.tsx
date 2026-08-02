import { createFileRoute } from "@tanstack/react-router";
import { requireGuru } from "@/lib/route-guards";
import { KelolaTestPage } from "@/features/tests/KelolaTestPage";

export const Route = createFileRoute("/_app/kelola-pretest")({
  beforeLoad: requireGuru,
  component: () => <KelolaTestPage title="Pretest" testType="pretest" />,
});