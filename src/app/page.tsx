import Link from "next/link";

const judyPortrait =
  "https://1.bp.blogspot.com/-YF9OOw5rB-U/X9tAimobl0I/AAAAAAAAGEU/t1PHyHLWS_sz09PM7YustUT6GJJDsaKbACPcBGAsYHg/w914-h514-p-k-no-nu/judy-alvarez-cyberpunk-2077-uhdpaper.com-4K-8.2294-wp.thumbnail.jpg";

export default function HomePage() {
  return (
    <main className="entry-os" id="main-content">
      <img
        className="entry-os__wallpaper"
        src={judyPortrait}
        alt=""
        aria-hidden="true"
      />
      <div className="entry-os__veil" aria-hidden="true" />

      <header className="entry-menubar">
        <div className="entry-menubar__brand">
          <span className="entry-mark" aria-hidden="true">TZ</span>
          <strong>Trace//Zero</strong>
          <span>forensic mirror</span>
        </div>
        <div className="entry-menubar__status">
          <span>CASE 001</span>
          <span>READ ONLY</span>
          <i aria-hidden="true" />
        </div>
      </header>

      <section className="entry-stage" aria-labelledby="entry-title">
        <article className="entry-login">
          <div className="entry-login__portrait">
            <img src={judyPortrait} alt="" />
          </div>

          <div className="entry-login__copy">
            <span className="entry-eyebrow">FORENSIC USER MIRROR</span>
            <h1 id="entry-title">Judy Alvarez</h1>
            <p>
              Ce poste est une copie figée de son environnement personnel.
              Rien ici ne modifie la machine originale.
            </p>

            <dl className="entry-login__meta">
              <div>
                <dt>last activity</dt>
                <dd>22:44:31</dd>
              </div>
              <div>
                <dt>device</dt>
                <dd>JUDY-LAPTOP</dd>
              </div>
              <div>
                <dt>state</dt>
                <dd>offline · 36h</dd>
              </div>
            </dl>

            <Link className="entry-login__button" href="/case/001">
              Entrer dans son ordinateur
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>

        <aside className="entry-glance" aria-label="Aperçu du dossier">
          <div>
            <span className="entry-eyebrow">RECENT SIGNAL</span>
            <strong>ORION session resumed</strong>
            <small>22:44 · unknown origin</small>
          </div>
          <div>
            <span className="entry-eyebrow">UNREAD</span>
            <strong>6 messages</strong>
            <small>1 external sender</small>
          </div>
          <div>
            <span className="entry-eyebrow">INTEGRITY</span>
            <strong>verified copy</strong>
            <small>no live access</small>
          </div>
        </aside>
      </section>

      <nav className="entry-dock" aria-label="État du système">
        <span>TRACE</span>
        <span>CASE_001</span>
        <span>JUDY-LAPTOP</span>
      </nav>

      <footer className="entry-footnote">
        Trace//Zero · forensic sandbox · local evidence only
      </footer>
    </main>
  );
}
