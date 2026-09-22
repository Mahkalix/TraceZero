import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing" id="main-content">
      <section className="landing__frame" aria-labelledby="case-title">
        <header className="landing__topline">
          <div className="landing__brand">
            <span>TRACE//ZERO</span>
            <small>FORENSIC INVESTIGATION SYSTEM</small>
          </div>
          <div className="landing__status">
            <span aria-hidden="true" className="status-dot" />
            <span>SYSTEM ONLINE</span>
          </div>
        </header>

        <div className="landing__content">
          <div className="landing__copy">
            <p className="landing__sequence">CASE_001 / SUBJECT_MISSING / 36H</p>

            <h1 id="case-title">
              ENTER
              <span> THE SYSTEM</span>
            </h1>

            <div className="landing__rule" aria-hidden="true">
              <span />
              <strong>01</strong>
            </div>

            <p className="landing__hook">
              Judy Alvarez n&apos;a pas été vue depuis 36 heures.
              Son ordinateur ne s&apos;est jamais déconnecté.
            </p>

            <p className="landing__summary">
              Analysez une copie forensic de son poste. Reconstituez ses
              dernières activités, isolez la compromission et ne validez aucune
              conclusion sans preuve.
            </p>

            <div className="landing__actions">
              <Link className="crt-action landing__enter" href="/case/001">
                <span>PLAY</span>
                OUVRIR LE DOSSIER
              </Link>
              <p className="landing__hint">
                INPUT: KEYBOARD / MOUSE
                <br />
                MEDIA: READ_ONLY
              </p>
            </div>
          </div>

          <aside className="landing__casefile" aria-label="Résumé du dossier Judy Alvarez">
            <div className="casefile__screen">
              <div className="casefile__screen-header">
                <span>SUBJECT PROFILE</span>
                <span>ACCESS: AUTHORIZED</span>
              </div>

              <div className="casefile__portrait" aria-hidden="true">
                <div className="casefile__target">
                  <span>JA</span>
                </div>
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
