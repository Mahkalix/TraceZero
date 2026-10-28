import { InvestigationDesktop } from "@/components/desktop/InvestigationDesktop";
import { notFound } from "next/navigation";

type CasePageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;
  if (caseId !== "001") notFound();

  return <InvestigationDesktop caseId={caseId} />;
}
