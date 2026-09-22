import { InvestigationDesktop } from "@/components/desktop/InvestigationDesktop";

type CasePageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;

  return <InvestigationDesktop caseId={caseId} />;
}
