type CasePageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;

  return (
    <main className="briefing">
      <section className="briefing__panel" aria-labelledby="briefing-title">
        <p className="eyebrow">Dossier {caseId}</p>
        <h1 id="briefing-title">Brief d&apos;investigation</h1>
        <dl className="briefing__facts">
          <div>
            <dt>Personne recherchée</dt>
            <dd>Judy Alvarez</dd>
          </div>
          <div>
            <dt>Entreprise</dt>
            <dd>Helix Systems</dd>
          </div>
          <div>
            <dt>Projet</dt>
            <dd>ORION</dd>
          </div>
        </dl>
        <p>
          Vous travaillez sur une copie forensic. Aucune action ne doit modifier
          les données originales.
        </p>
      </section>
    </main>
  );
}
