"use client";

import { useEffect, useMemo, useState } from "react";
import { evidenceCatalog } from "@/data/chapter-01/evidence";
import {
  emails,
  phishingEmailId,
  type CaseEmail,
} from "@/data/chapter-01/emails";
import {
  analyzePhishingSignals,
  type PhishingSignal,
} from "@/features/investigation/phishing";
import {
  initialProgress,
  readProgress,
  writeProgress,
  type InvestigationProgress,
} from "@/features/investigation/progress";

type ActiveApp = "case" | "mail" | "files" | "terminal" | "network" | "timeline";
type NotebookTab = "evidence" | "hypotheses";

const signalLabels: Record<PhishingSignal, string> = {
  sender: "Expéditeur externe ou inhabituel",
  domain: "Domaine ressemblant au domaine officiel",
  link: "Adresse réelle différente du lien affiché",
  urgency: "Pression temporelle artificielle",
};

export function InvestigationDesktop({ caseId }: { caseId: string }) {
  const [activeApp, setActiveApp] = useState<ActiveApp>("case");
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0].id);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [signals, setSignals] = useState<PhishingSignal[]>([]);
  const [notebookTab, setNotebookTab] = useState<NotebookTab>("evidence");
  const [progress, setProgress] =
    useState<InvestigationProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeProgress(progress);
  }, [hydrated, progress]);

  const selectedEmail = useMemo(
    () => emails.find((email) => email.id === selectedEmailId) ?? emails[0],
    [selectedEmailId],
  );

  const hasE01 = progress.discoveredEvidenceIds.includes("E01");
  const hasE02 = progress.discoveredEvidenceIds.includes("E02");
  const canValidateHypothesis = hasE01 && hasE02;
  const hypothesisValidated =
    progress.validatedHypothesisIds.includes("H01");

  function startInvestigation() {
    setActiveApp("mail");
    setProgress((current) => ({ ...current, currentStep: "mail" }));
    setAnnouncement("Messagerie de Judy ouverte.");
  }

  function toggleSignal(signal: PhishingSignal) {
    setSignals((current) =>
      current.includes(signal)
        ? current.filter((item) => item !== signal)
        : [...current, signal],
    );
  }

  function validateAnalysis() {
    if (selectedEmail.id !== phishingEmailId) {
      setAnnouncement(
        "Cette analyse ne révèle pas suffisamment d'indices exploitables.",
      );
      return;
    }

    const result = analyzePhishingSignals(signals);

    if (!result.isEnough) {
      setAnnouncement(
        "Analyse incomplète. Sélectionnez au moins deux indices pertinents.",
      );
      return;
    }

    setProgress((current) => ({
      ...current,
      currentStep: "conclusion",
      discoveredEvidenceIds: [
        ...new Set([...current.discoveredEvidenceIds, ...result.evidenceIds]),
      ],
    }));
    setNotebookTab("evidence");
    setAnnouncement(
      "Analyse confirmée. Les nouvelles preuves ont été ajoutées au carnet.",
    );
  }

  function validateHypothesis() {
    if (!canValidateHypothesis || hypothesisValidated) return;

    setProgress((current) => ({
      ...current,
      validatedHypothesisIds: [
        ...current.validatedHypothesisIds,
        "H01",
      ],
    }));
    setAnnouncement(
      "Hypothèse H01 validée : Judy a probablement été ciblée par un phishing.",
    );
  }

  function renderMail() {
    return (
      <div className="mail-app">
        <aside className="mail-list" aria-label="Boîte de réception">
          <div className="mail-list__heading">
            <p className="eyebrow">Messages</p>
            <strong>{emails.length} emails</strong>
          </div>
          {emails.map((email) => (
            <button
              className="mail-list__item"
              data-active={email.id === selectedEmail.id}
              key={email.id}
              onClick={() => {
                setSelectedEmailId(email.id);
                setAnalysisOpen(false);
                setSignals([]);
              }}
              type="button"
            >
              <span>{email.from}</span>
              <strong>{email.subject}</strong>
              <small>{email.date}</small>
            </button>
          ))}
        </aside>

        <article className="mail-reader" aria-labelledby="mail-subject">
          <header className="mail-reader__header">
            <div>
              <p className="eyebrow">{selectedEmail.date}</p>
              <h2 id="mail-subject">{selectedEmail.subject}</h2>
              <p>
                De <span className="mono">{selectedEmail.from}</span>
              </p>
              <p>
                À <span className="mono">{selectedEmail.to}</span>
              </p>
            </div>
            {selectedEmail.external ? (
              <span className="status-badge status-badge--warning">
                Externe
              </span>
            ) : null}
          </header>

          <div className="mail-reader__body">
            {selectedEmail.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {selectedEmail.displayLink ? (
              <div className="fake-link">
                <span>Lien affiché</span>
                <strong>{selectedEmail.displayLink}</strong>
                <span>Destination réelle</span>
                <code>{selectedEmail.actualLink}</code>
              </div>
            ) : null}
          </div>

          <div className="mail-reader__actions">
            <button
              className="button"
              type="button"
              onClick={() => {
                setAnalysisOpen((open) => !open);
                setProgress((current) => ({
                  ...current,
                  currentStep: "analysis",
                }));
              }}
              aria-expanded={analysisOpen}
              aria-controls="analysis-panel"
            >
              Analyser ce message
            </button>
          </div>

          {analysisOpen ? (
            <section
              className="analysis-panel"
              id="analysis-panel"
              aria-labelledby="analysis-title"
            >
              <h3 id="analysis-title">Quels éléments sont suspects ?</h3>
              <p>
                Sélectionnez les indices que vous jugez pertinents, puis
                confrontez votre hypothèse aux preuves.
              </p>
              <fieldset>
                <legend>Indices observés</legend>
                {(
                  Object.entries(signalLabels) as [
                    PhishingSignal,
                    string,
                  ][]
                ).map(([signal, label]) => (
                  <label key={signal}>
                    <input
                      checked={signals.includes(signal)}
                      onChange={() => toggleSignal(signal)}
                      type="checkbox"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
              <button
                className="button button--secondary"
                type="button"
                onClick={validateAnalysis}
              >
                Valider l'analyse
              </button>
            </section>
          ) : null}
        </article>
      </div>
    );
  }

  function renderActiveWindow() {
    if (activeApp === "mail") return renderMail();

    if (activeApp === "case") {
      return (
        <section className="case-brief" aria-labelledby="case-brief-title">
          <p className="eyebrow">Dossier {caseId}</p>
          <h2 id="case-brief-title">Judy Alvarez · disparition signalée</h2>
          <p className="case-brief__lead">
            Judy n'a pas été vue depuis 36 heures. Son poste a pourtant
            continué à produire de l'activité.
          </p>
          <dl className="briefing__facts">
            <div>
              <dt>Entreprise</dt>
              <dd>Helix Systems</dd>
            </div>
            <div>
              <dt>Projet</dt>
              <dd>ORION</dd>
            </div>
            <div>
              <dt>Support</dt>
              <dd>Copie forensic en lecture seule</dd>
            </div>
          </dl>
          <h3>Objectifs</h3>
          <ol className="objectives">
            <li>Déterminer si le compte de Judy a été compromis.</li>
            <li>Identifier le vecteur d'entrée.</li>
            <li>Retrouver les données consultées.</li>
            <li>Comprendre pourquoi Judy a disparu.</li>
          </ol>
          <button className="button" type="button" onClick={startInvestigation}>
            Commencer par les messages
          </button>
        </section>
      );
    }

    return (
      <section className="placeholder-app" aria-labelledby="placeholder-title">
        <p className="eyebrow">Module verrouillé</p>
        <h2 id="placeholder-title">{activeApp}</h2>
        <p>
          Cette application sera débloquée dans la suite de l'enquête. Pour la
          vertical slice actuelle, concentrez-vous sur les messages.
        </p>
      </section>
    );
  }

  return (
    <main className="desktop-shell" id="main-content">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <header className="desktop-topbar">
        <div>
          <span className="desktop-topbar__brand">TRACE//ZERO</span>
          <span className="desktop-topbar__case">CASE {caseId}</span>
        </div>
        <div className="desktop-topbar__status">
          <span aria-hidden="true" className="status-dot" />
          forensic copy · read only
        </div>
      </header>

      <nav className="desktop-sidebar" aria-label="Applications d'investigation">
        {(
          [
            ["case", "Dossier"],
            ["mail", "Messages"],
            ["files", "Fichiers"],
            ["terminal", "Terminal"],
            ["network", "Réseau"],
            ["timeline", "Chronologie"],
          ] as [ActiveApp, string][]
        ).map(([app, label]) => (
          <button
            aria-pressed={activeApp === app}
            className="desktop-sidebar__item"
            data-active={activeApp === app}
            key={app}
            onClick={() => setActiveApp(app)}
            type="button"
          >
            <span className="desktop-sidebar__key" aria-hidden="true">
              {label.slice(0, 2).toUpperCase()}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <section className="desktop-workspace" aria-label="Fenêtre active">
        <div className="window">
          <div className="window__titlebar">
            <span>JUDY-LAPTOP / {activeApp.toUpperCase()}</span>
            <span className="mono">READ_ONLY</span>
          </div>
          <div className="window__content">{renderActiveWindow()}</div>
        </div>
      </section>

      <aside className="notebook" aria-labelledby="notebook-title">
        <header className="notebook__header">
          <div>
            <p className="eyebrow">Carnet</p>
            <h2 id="notebook-title">Investigation</h2>
          </div>
          <span className="notebook__count">
            {progress.discoveredEvidenceIds.length}/2
          </span>
        </header>

        <div className="notebook__tabs" role="tablist" aria-label="Carnet">
          <button
            aria-selected={notebookTab === "evidence"}
            onClick={() => setNotebookTab("evidence")}
            role="tab"
            type="button"
          >
            Preuves
          </button>
          <button
            aria-selected={notebookTab === "hypotheses"}
            onClick={() => setNotebookTab("hypotheses")}
            role="tab"
            type="button"
          >
            Hypothèses
          </button>
        </div>

        {notebookTab === "evidence" ? (
          <div className="notebook__panel" role="tabpanel">
            {progress.discoveredEvidenceIds.length === 0 ? (
              <p className="empty-state">
                Aucune preuve confirmée. Analysez les éléments du dossier.
              </p>
            ) : (
              progress.discoveredEvidenceIds.map((id) => {
                const evidence = evidenceCatalog[id];
                return (
                  <article className="evidence-card" key={id}>
                    <span className="evidence-card__id">{evidence.id}</span>
                    <h3>{evidence.title}</h3>
                    <p>{evidence.description}</p>
                  </article>
                );
              })
            )}
          </div>
        ) : (
          <div className="notebook__panel" role="tabpanel">
            <article className="hypothesis-card">
              <span className="evidence-card__id">H01</span>
              <h3>Phishing ciblé</h3>
              <p>
                Judy a probablement reçu un message conçu pour voler sa session
                ORION.
              </p>
              <p className="hypothesis-card__requirements">
                Requiert E01 + E02
              </p>
              <button
                className="button button--secondary"
                disabled={!canValidateHypothesis || hypothesisValidated}
                onClick={validateHypothesis}
                type="button"
              >
                {hypothesisValidated
                  ? "Hypothèse validée"
                  : "Valider la conclusion"}
              </button>
            </article>
          </div>
        )}
      </aside>
    </main>
  );
}
