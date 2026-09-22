"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { evidenceCatalog } from "@/data/chapter-01/evidence";
import { emails, phishingEmailId } from "@/data/chapter-01/emails";
import { sessionEvents } from "@/data/chapter-01/network";
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
import { runTerminalCommand } from "@/features/investigation/terminal";

type ActiveApp =
  | "case"
  | "mail"
  | "network"
  | "terminal"
  | "files"
  | "timeline";

type NotebookTab = "evidence" | "hypotheses";

type TerminalLine = {
  id: number;
  command?: string;
  output?: string;
};

const signalLabels: Record<PhishingSignal, string> = {
  sender: "expéditeur externe",
  domain: "domaine ressemblant",
  link: "destination réelle différente",
  urgency: "pression temporelle",
};

const appItems: Array<{
  id: ActiveApp;
  label: string;
  code: string;
}> = [
  { id: "case", label: "Dossier", code: "01" },
  { id: "mail", label: "Messages", code: "02" },
  { id: "network", label: "Réseau", code: "03" },
  { id: "terminal", label: "Terminal", code: "04" },
  { id: "files", label: "Fichiers", code: "05" },
  { id: "timeline", label: "Timeline", code: "06" },
];

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
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 1,
      output: "TRACE FORENSIC SHELL v0.1 / type 'help' / READ_ONLY",
    },
  ]);

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

  const discovered = new Set(progress.discoveredEvidenceIds);
  const hasPhishingEvidence = discovered.has("E01") && discovered.has("E02");
  const hasNetworkEvidence = discovered.has("E03") && discovered.has("E04");
  const hypothesisValidated = progress.validatedHypothesisIds.includes("H01");

  function addEvidence(ids: string[]) {
    setProgress((current) => ({
      ...current,
      discoveredEvidenceIds: [
        ...new Set([...current.discoveredEvidenceIds, ...ids]),
      ],
    }));
  }

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
      setAnnouncement("Aucun signal suffisant sur ce message.");
      return;
    }

    const result = analyzePhishingSignals(signals);

    if (!result.isEnough) {
      setAnnouncement("Analyse incomplète. Deux indices minimum.");
      return;
    }

    addEvidence(result.evidenceIds);
    setNotebookTab("evidence");
    setAnnouncement("E01 et E02 ajoutées au carnet.");
  }

  function validateHypothesis() {
    if (!hasPhishingEvidence || hypothesisValidated) return;

    setProgress((current) => ({
      ...current,
      validatedHypothesisIds: [...current.validatedHypothesisIds, "H01"],
    }));
    setAnnouncement("H01 validée. Le module réseau devient prioritaire.");
  }

  function compareSessions() {
    addEvidence(["E03", "E04"]);
    setNotebookTab("evidence");
    setAnnouncement("E03 et E04 ajoutées au carnet.");
  }

  function submitTerminal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;

    const result = runTerminalCommand(command);
    setTerminalInput("");

    if (result.clear) {
      setTerminalLines([]);
      return;
    }

    setTerminalLines((current) => {
      const nextId = current.length ? current[current.length - 1].id + 1 : 1;
      const additions: TerminalLine[] = [
        { id: nextId, command },
        ...result.output.map((output, index) => ({
          id: nextId + index + 1,
          output,
        })),
      ];
      return [...current, ...additions];
    });

    if (result.evidenceIds?.length) {
      addEvidence(result.evidenceIds);
      setAnnouncement(
        `${result.evidenceIds.join(" + ")} ajoutée(s) au carnet.`,
      );
    }
  }

  function renderCase() {
    return (
      <section className="case-screen" aria-labelledby="case-brief-title">
        <div className="case-screen__masthead">
          <span className="screen-code">CASE_{caseId}</span>
          <span className="screen-index">01 / DOSSIER</span>
        </div>

        <div className="case-screen__hero">
          <div>
            <p className="crt-kicker">SUBJECT / MISSING PERSON</p>
            <h2 id="case-brief-title">JUDY ALVAREZ</h2>
            <p className="case-screen__lead">
              Disparue depuis 36 heures. Son ordinateur continue pourtant à
              produire de l&apos;activité.
            </p>
          </div>
          <div className="subject-id" aria-hidden="true">
            <span>JA</span>
            <small>ID 2903</small>
          </div>
        </div>

        <div className="case-screen__grid">
          <dl className="data-grid">
            <div><dt>EMPLOYER</dt><dd>HELIX SYSTEMS</dd></div>
            <div><dt>PROJECT</dt><dd>ORION</dd></div>
            <div><dt>LAST SEEN</dt><dd>12 OCT / 21:36</dd></div>
            <div><dt>MEDIA</dt><dd>FORENSIC COPY</dd></div>
          </dl>

          <div className="mission-block">
            <span className="screen-code">MISSION</span>
            <ol>
              <li>Vérifier la compromission du compte.</li>
              <li>Identifier le vecteur d&apos;entrée.</li>
              <li>Tracer les données consultées.</li>
              <li>Documenter chaque conclusion.</li>
            </ol>
          </div>
        </div>

        <button className="crt-action" type="button" onClick={startInvestigation}>
          <span>ENTER</span> OUVRIR LES MESSAGES
        </button>
      </section>
    );
  }

  function renderMail() {
    return (
      <div className="mail-app">
        <aside className="mail-list" aria-label="Boîte de réception">
          <div className="module-header">
            <span>MAILBOX</span>
            <span>{String(emails.length).padStart(2, "0")} ITEMS</span>
          </div>
          {emails.map((email, index) => (
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
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{email.from}</span>
              <strong>{email.subject}</strong>
              <time>{email.date}</time>
            </button>
          ))}
        </aside>

        <article className="mail-reader" aria-labelledby="mail-subject">
          <div className="module-header">
            <span>MESSAGE_VIEWER</span>
            <span>{selectedEmail.id.toUpperCase()}</span>
          </div>

          <header className="mail-reader__header">
            <div>
              <p className="crt-kicker">{selectedEmail.date}</p>
              <h2 id="mail-subject">{selectedEmail.subject}</h2>
            </div>
            {selectedEmail.external ? (
              <span className="warning-label">EXTERNAL</span>
            ) : null}
          </header>

          <dl className="mail-meta">
            <div><dt>FROM</dt><dd>{selectedEmail.from}</dd></div>
            <div><dt>TO</dt><dd>{selectedEmail.to}</dd></div>
          </dl>

          <div className="mail-reader__body">
            {selectedEmail.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {selectedEmail.displayLink ? (
              <div className="trace-box">
                <span>DISPLAY</span>
                <strong>{selectedEmail.displayLink}</strong>
                <span>RESOLVES TO</span>
                <code>{selectedEmail.actualLink}</code>
              </div>
            ) : null}
          </div>

          <button
            className="crt-action"
            type="button"
            onClick={() => setAnalysisOpen((open) => !open)}
            aria-expanded={analysisOpen}
            aria-controls="analysis-panel"
          >
            <span>SCAN</span> ANALYSER CE MESSAGE
          </button>

          {analysisOpen ? (
            <section
              className="analysis-panel"
              id="analysis-panel"
              aria-labelledby="analysis-title"
            >
              <div className="module-header">
                <span id="analysis-title">SIGNAL ANALYSIS</span>
                <span>{signals.length}/4 SELECTED</span>
              </div>
              <fieldset>
                <legend className="sr-only">Indices observés</legend>
                {(Object.entries(signalLabels) as [PhishingSignal, string][]).map(
                  ([signal, label], index) => (
                    <label key={signal} className="signal-option">
                      <input
                        checked={signals.includes(signal)}
                        onChange={() => toggleSignal(signal)}
                        type="checkbox"
                      />
                      <span className="signal-option__index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{label}</span>
                    </label>
                  ),
                )}
              </fieldset>
              <button
                className="crt-action crt-action--compact"
                type="button"
                onClick={validateAnalysis}
              >
                CONFIRMER LES SIGNAUX
              </button>
            </section>
          ) : null}
        </article>
      </div>
    );
  }

  function renderNetwork() {
    if (!hypothesisValidated) {
      return (
        <section className="locked-module">
          <span className="screen-code">MODULE 03</span>
          <h2>NETWORK TRACE</h2>
          <p>Validez H01 pour contextualiser les événements réseau.</p>
          <button type="button" className="text-link" onClick={() => setNotebookTab("hypotheses")}>
            OUVRIR LES HYPOTHÈSES →
          </button>
        </section>
      );
    }

    return (
      <section className="network-screen" aria-labelledby="network-title">
        <div className="module-header">
          <span id="network-title">AUTH SESSION TRACE</span>
          <span>22:41—22:45</span>
        </div>

        <div className="network-summary">
          <div>
            <span className="screen-code">SESSION</span>
            <strong>S-4831</strong>
          </div>
          <div>
            <span className="screen-code">USER</span>
            <strong>judy.alvarez</strong>
          </div>
          <div>
            <span className="screen-code">ANOMALY</span>
            <strong className="warning-text">2 DEVICES</strong>
          </div>
        </div>

        <div className="log-table" role="table" aria-label="Événements de session">
          <div className="log-row log-row--head" role="row">
            <span role="columnheader">TIME</span>
            <span role="columnheader">DEVICE</span>
            <span role="columnheader">IP</span>
            <span role="columnheader">EVENT</span>
          </div>
          {sessionEvents.map((event) => (
            <div className="log-row" role="row" key={event.id}>
              <span role="cell">{event.time}</span>
              <span role="cell" data-anomaly={event.device === "UNKNOWN-WIN"}>
                {event.device}
              </span>
              <span role="cell">{event.ip}</span>
              <span role="cell">{event.event}</span>
            </div>
          ))}
        </div>

        <div className="network-diagram" aria-label="Comparaison des sessions">
          <div className="node node--trusted">
            <span>JUDY-LAPTOP</span>
            <small>10.24.16.12</small>
          </div>
          <div className="network-line">
            <span>S-4831</span>
          </div>
          <div className="node node--alert">
            <span>UNKNOWN-WIN</span>
            <small>198.51.100.73</small>
          </div>
        </div>

        <button className="crt-action" type="button" onClick={compareSessions}>
          COMPARER LES SESSIONS
        </button>
      </section>
    );
  }

  function renderTerminal() {
    if (!hasNetworkEvidence) {
      return (
        <section className="locked-module">
          <span className="screen-code">MODULE 04</span>
          <h2>FORENSIC SHELL</h2>
          <p>Confirmez d&apos;abord l&apos;anomalie de session dans Réseau.</p>
          <button type="button" className="text-link" onClick={() => setActiveApp("network")}>
            OUVRIR RÉSEAU →
          </button>
        </section>
      );
    }

    return (
      <section className="terminal-screen" aria-labelledby="terminal-title">
        <div className="module-header">
          <span id="terminal-title">TRACE SHELL</span>
          <span>SIMULATED / READ_ONLY</span>
        </div>

        <div className="terminal-output" aria-live="polite">
          {terminalLines.map((line) =>
            line.command ? (
              <p key={line.id} className="terminal-command">
                <span>judy@trace:~$</span> {line.command}
              </p>
            ) : (
              <p key={line.id}>{line.output}</p>
            ),
          )}
        </div>

        <form className="terminal-form" onSubmit={submitTerminal}>
          <label htmlFor="terminal-command">judy@trace:~$</label>
          <input
            id="terminal-command"
            value={terminalInput}
            onChange={(event) => setTerminalInput(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="terminal-hint"
          />
          <button type="submit">RUN</button>
        </form>
        <p id="terminal-hint" className="terminal-hint">
          Essayez <code>help</code>, puis <code>ls</code>.
        </p>
      </section>
    );
  }

  function renderPlaceholder(title: string, code: string) {
    return (
      <section className="locked-module">
        <span className="screen-code">MODULE {code}</span>
        <h2>{title.toUpperCase()}</h2>
        <p>Module non requis pour la vertical slice actuelle.</p>
      </section>
    );
  }

  function renderActiveWindow() {
    if (activeApp === "case") return renderCase();
    if (activeApp === "mail") return renderMail();
    if (activeApp === "network") return renderNetwork();
    if (activeApp === "terminal") return renderTerminal();
    if (activeApp === "files") return renderPlaceholder("Fichiers", "05");
    return renderPlaceholder("Timeline", "06");
  }

  return (
    <main className="desktop-shell" id="main-content">
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <header className="system-header">
        <div className="system-header__identity">
          <span className="system-label">CUSTOMER</span>
          <strong>TRACE//ZERO</strong>
          <span className="system-id">#NCB8402 / CASE_{caseId}</span>
        </div>

        <div className="system-header__subject">
          <span className="system-label">SUBJECT</span>
          <strong>JUDY ALVAREZ</strong>
          <span>HELIX SYSTEMS / ORION</span>
        </div>

        <div className="security-levels" aria-label="Niveaux de sécurité">
          <span className="system-label">SECURITY LEVEL</span>
          <div>
            <span className="security-level">T1</span>
            <span className="security-level security-level--active">T2</span>
            <span className="security-level">T3</span>
            <span className="security-level">T4</span>
          </div>
        </div>
      </header>

      <nav className="system-nav" aria-label="Applications d'investigation">
        <div className="system-nav__legend">
          <span>COMPUTER SYSTEMS</span>
          <small>READ_ONLY ENVIRONMENT</small>
        </div>
        <div className="system-nav__items">
          {appItems.map((app) => (
            <button
              aria-pressed={activeApp === app.id}
              className="system-nav__item"
              data-active={activeApp === app.id}
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              type="button"
            >
              <span>{app.label}</span>
              <small>{app.code}</small>
            </button>
          ))}
        </div>
        <div className="system-nav__state">
          <span aria-hidden="true" className="status-dot" />
          ONLINE
        </div>
      </nav>

      <section className="desktop-workspace" aria-label="Fenêtre active">
        <span className="edge-label edge-label--left" aria-hidden="true">
          TRACE SYSTEM / INTERNAL USE
        </span>
        <span className="edge-label edge-label--right" aria-hidden="true">
          SESSION 001 / VERIFIED COPY
        </span>

        <div className="window">
          <div className="window__titlebar">
            <span>CONTENT / {activeApp.toUpperCase()}</span>
            <span>JUDY-LAPTOP · READ_ONLY</span>
          </div>
          <div className="window__content">{renderActiveWindow()}</div>
        </div>
      </section>

      <aside className="notebook" aria-labelledby="notebook-title">
        <div className="module-header">
          <span id="notebook-title">CASE NOTES</span>
          <span>{String(progress.discoveredEvidenceIds.length).padStart(2, "0")}/06</span>
        </div>

        <div className="notebook__tabs" role="tablist" aria-label="Carnet">
          <button
            aria-selected={notebookTab === "evidence"}
            onClick={() => setNotebookTab("evidence")}
            role="tab"
            type="button"
          >
            EVIDENCE
          </button>
          <button
            aria-selected={notebookTab === "hypotheses"}
            onClick={() => setNotebookTab("hypotheses")}
            role="tab"
            type="button"
          >
            HYPOTHESIS
          </button>
        </div>

        {notebookTab === "evidence" ? (
          <div className="notebook__panel" role="tabpanel">
            {progress.discoveredEvidenceIds.length === 0 ? (
              <p className="empty-state">NO VERIFIED EVIDENCE</p>
            ) : (
              progress.discoveredEvidenceIds.map((id) => {
                const evidence = evidenceCatalog[id];
                if (!evidence) return null;
                return (
                  <article className="evidence-card" key={id}>
                    <div className="evidence-card__topline">
                      <span>{evidence.id}</span>
                      <span>VERIFIED</span>
                    </div>
                    <h3>{evidence.title}</h3>
                    <p>{evidence.description}</p>
                    <small>{evidence.source}</small>
                  </article>
                );
              })
            )}
          </div>
        ) : (
          <div className="notebook__panel" role="tabpanel">
            <article className="hypothesis-card">
              <div className="evidence-card__topline">
                <span>H01</span>
                <span>{hypothesisValidated ? "CONFIRMED" : "PENDING"}</span>
              </div>
              <h3>PHISHING CIBLÉ</h3>
              <p>
                Judy a reçu un message conçu pour capturer sa session ORION.
              </p>
              <div className="requirement-line">
                <span>E01</span>
                <span>+</span>
                <span>E02</span>
              </div>
              <button
                className="crt-action crt-action--compact"
                disabled={!hasPhishingEvidence || hypothesisValidated}
                onClick={validateHypothesis}
                type="button"
              >
                {hypothesisValidated ? "H01 CONFIRMÉE" : "VALIDER H01"}
              </button>
            </article>
          </div>
        )}
      </aside>

      <footer className="desktop-footer">
        <span>TRACE FORENSIC SANDBOX</span>
        <span>CASE_{caseId} · SUBJECT_JUDY_ALVAREZ</span>
        <span>NO LIVE SYSTEM ACCESS</span>
      </footer>
    </main>
  );
}
