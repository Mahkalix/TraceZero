import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="landing__panel" aria-labelledby="case-title">
        <p className="eyebrow">Dossier 001 · Judy Alvarez</p>
        <h1 id="case-title">Trace//Zero</h1>
        <p className="landing__hook">
          Judy Alvarez n&apos;a pas été vue depuis 36 heures. Son ordinateur,
          lui, ne s&apos;est jamais déconnecté.
        </p>
        <p className="landing__summary">
          Reconstituez les dernières heures de Judy à partir d&apos;une copie
          forensic et identifiez les preuves d&apos;une compromission.
        </p>
        <Link className="button" href="/case/001">
          Ouvrir le dossier 001
        </Link>
      </section>
    </main>
  );
}
