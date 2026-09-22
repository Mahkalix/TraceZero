import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing" id="main-content">
      <section className="landing__frame" aria-labelledby="case-title">
        <header className="landing__topline" aria-label="Statut du dossier">
          <span className="landing__status">
            <span aria-hidden="true" className="status-dot" />
            dossier actif
          </span>
          <span className="mono">CASE_001 / READ_ONLY</span>
        </header>
        <div className="landing__content">
          <div className="landing__copy">
            <p className="eyebrow">Trace de disparition · 36h</p>
            <h1 id="case-title">Trace<span aria-hidden="true">//</span>Zero</h1>
            <p className="landing__hook">
              Judy Alvarez n&apos;a pas été vue depuis 36 heures.
              <span> Son ordinateur, lui, ne s&apos;est jamais déconnecté.</span>
            </p>
            <p className="landing__summary">
              Vous recevez une copie forensic de son poste. Votre mission :
              reconstruire ses dernières heures, isoler une compromission et
              soutenir chaque conclusion par des preuves.
            </p>
            <div className="landing__actions">
              <Link className="button" href="/case/001">Ouvrir le dossier 001</Link>
              <span className="landing__hint mono">aucune donnée originale ne sera modifiée</span>
            </div>
          </div>
          <aside className="landing__casefile" aria-label="Résumé du dossier">
            <div className="casefile__portrait" aria-hidden="true"><span>JA</span></div>
            <div className="casefile__identity">
              <p className="eyebrow">Personne recherchée</p>
              <h2>Judy Alvarez</h2>
              <p>Développeuse backend · Helix Systems</p>
            </div>
            <dl className="casefile__metadata">
              <div><dt>Projet</dt><dd>ORION</dd></div>
              <div><dt>Dernière activité</dt><dd>12 oct. · 22:44</dd></div>
              <div><dt>État</dt><dd>Disparition non résolue</dd></div>
            </dl>
          </aside>
        </div>
        <footer className="landing__footer mono">
          <span>FORENSIC_SANDBOX v0.1</span>
          <span>INTEGRITY: VERIFIED</span>
        </footer>
      </section>
    </main>
  );
}
