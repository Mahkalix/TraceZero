import Link from "next/link";

const judyWallpaper = "/judy-apartment.jpg";

export default function HomePage() {
  return (
    <main className="entry-os" id="main-content">
      <img
        className="entry-os__wallpaper"
        src={judyWallpaper}
        alt=""
        aria-hidden="true"
      />
      <div className="entry-os__veil" aria-hidden="true" />

      <header className="entry-menubar">
        <div>
          <img className="trace-logo" src="/trace-mark.svg" alt="" />
          <strong>Trace//Zero</strong>
        </div>
        <span>TRACE OS / Linux forensic edition</span>
      </header>

      <section className="entry-stage" aria-labelledby="entry-title">
        <article className="entry-card">
          <span className="entry-eyebrow">UN JEU D’ENQUÊTE CYBER · DOSSIER 001</span>
          <h1 id="entry-title">Entrer dans l’ordinateur de Judy.</h1>
          <p>
            Elle a disparu il y a 36 heures. Sa machine, elle, a continué à
            laisser des traces.
          </p>
          <p className="entry-explanation">Vous enquêtez depuis une copie de son ordinateur. Explorez ses messages, recoupez les connexions et vérifiez les fichiers pour comprendre ce qui s’est passé.</p>

          <Link className="entry-button" href="/case/001">
            Ouvrir le bureau
            <span aria-hidden="true">↗</span>
          </Link>

          <small>
            Jouable dans votre navigateur · Sans inscription · Progression sauvegardée sur cet appareil.
          </small>
        </article>
        <aside className="entry-guide" aria-labelledby="guide-title">
          <div className="guide-chrome"><span className="os-status-dot" /> bienvenue.txt <span>~/trace/briefing</span></div>
          <div className="entry-guide__body">
            <span className="entry-eyebrow">VOTRE MISSION</span>
            <h2 id="guide-title">Les réponses sont dans les traces.</h2>
            <ol>
              <li><span>01</span><div><strong>Explorez le bureau</strong><p>Ouvrez les applications depuis le lanceur. Déplacez, réduisez ou agrandissez les fenêtres.</p></div></li>
              <li><span>02</span><div><strong>Reliez les indices</strong><p>Repérez le phishing, comparez les sessions réseau et inspectez l’archive ORION.</p></div></li>
              <li><span>03</span><div><strong>Construisez votre conclusion</strong><p>Rassemblez six preuves dans le carnet et validez votre hypothèse pour clore le dossier technique.</p></div></li>
            </ol>
            <p className="guide-note">Aucune connaissance en cybersécurité requise. Le terminal est simulé et les commandes sont expliquées dans le jeu.</p>
          </div>
        </aside>
      </section>
      <footer className="entry-footer">Une disparition. Un ordinateur. À vous de reconstituer les faits.<span>Environnement fictif · Aucune action sur un système réel</span></footer>
    </main>
  );
}
