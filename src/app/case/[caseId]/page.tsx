import { InvestigationDesktop } from "@/components/desktop/InvestigationDesktop";
import { notFound } from "next/navigation";
import { StationBoot } from "@/components/desktop/StationBoot";

type CasePageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;
  if (caseId !== "001") notFound();

  return <StationBoot><InvestigationDesktop caseId={caseId} /></StationBoot>;
}
