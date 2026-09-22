import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing" id="main-content">
      <section className="landing__frame" aria-labelledby="case-title">
        <header className="landing__topline">
          <div className="landing__brand">
            <span className="landing__brandmark" aria-hidden="true">TZ</span>
            <div>
              <span>TRACE//ZERO</span>
              <small>FORENSIC INTERFACE SYSTEM</small>
            </div>
          </div>
          <div className="landing__page">
            <strong>01 / 06</strong>
            <span>CASE PAGE</span>
          </div>
        </header>

        <div className="landing__guide" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>

        <div className="landing__content">
          <div className="landing__copy">
            <p className="landing__sequence">CASE_001 · JUDY ALVAREZ</p>
            <div className="landing__title-row">
              <h1 id="case-title">TRACE//ZERO</h1>
              <span>FORENSIC CASE FILE</span>
            </div>
            <p className="landing__hook">
              Judy Alvarez n&apos;a pas été vue depuis 36 heures.
              Son ordinateur ne s&apos;est jamais déconnecté.
            </p>
            <p className="landing__summary">
              Analysez une copie forensic de son poste, recoupez les traces,
              isolez la compromission et documentez chaque conclusion.
            </p>
            <div className="landing__actions">
              <Link className="hud-button hud-button--primary" href="/case/001">
                OUVRIR LE DOSSIER
              </Link>
              <span className="landing__hint">
                INPUT: KEYBOARD / MOUSE · MEDIA: READ_ONLY
              </span>
            </div>
          </div>

          <aside className="landing__casefile" aria-label="Résumé du dossier Judy Alvarez">
            <div className="casefile__screen">
              <div className="casefile__screen-header">
                <span>SUBJECT PROFILE</span>
                <span>ACCESS: AUTHORIZED</span>
              </div>
              <div className="casefile__portrait" aria-hidden="true">
                <div className="casefile__target"><span>JA</span></div>
                <div className="casefile__crosshair" />
              </div>
              <div className="casefile__identity">
                <span className="screen-code">SUBJECT_01</span>
                <h2>JUDY ALVAREZ</h2>
                <p>BACKEND DEVELOPER / HELIX SYSTEMS</p>
              </div>
              <dl className="casefile__metadata">
                <div><dt>PROJECT</dt><dd>ORION</dd></div>
                <div><dt>LAST SIGNAL</dt><dd>22:44:31</dd></div>
                <div><dt>STATUS</dt><dd className="casefile__alert">MISSING</dd></div>
                <div><dt>INTEGRITY</dt><dd>VERIFIED COPY</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        <footer className="landing__footer">
          <span>TRACE FORENSIC SANDBOX · BUILD 2026.09</span>
          <span>NO LIVE SYSTEM ACCESS</span>
          <span>CASE 001</span>
        </footer>
      </section>
    </main>
  );
}
