import { createFileRoute } from "@tanstack/react-router";
import { requireGuru } from "@/lib/route-guards";
import { KelolaTestPage } from "@/features/tests/KelolaTestPage";

export const Route = createFileRoute("/_app/kelola-posttest-siklus1")({
  beforeLoad: requireGuru,
  component: () => <KelolaTestPage title="Posttest Siklus 1" testType="posttest_siklus_1" />,
});