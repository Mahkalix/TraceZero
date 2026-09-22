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
          <span className="entry-mark" aria-hidden="true">TZ</span>
          <strong>Trace//Zero</strong>
        </div>
        <span>forensic mirror · read only</span>
      </header>

      <section className="entry-stage" aria-labelledby="entry-title">
        <article className="entry-card">
          <span className="entry-eyebrow">CASE 001</span>
          <h1 id="entry-title">Entrer dans l’ordinateur de Judy.</h1>
          <p>
            Elle a disparu il y a 36 heures. Sa machine, elle, a continué à
            laisser des traces.
          </p>

          <Link className="entry-button" href="/case/001">
            Ouvrir le bureau
            <span aria-hidden="true">↗</span>
          </Link>

          <small>
            Copie forensic locale. Aucune action ne touche un système réel.
          </small>
        </article>
      </section>
    </main>
  );
}
