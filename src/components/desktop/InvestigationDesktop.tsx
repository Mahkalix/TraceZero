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

const dockApps: Array<{
  id: ActiveApp;
  label: string;
  glyph: string;
  code: string;
}> = [
  { id: "case", label: "Dossier", glyph: "◫", code: "01" },
  { id: "mail", label: "Messages", glyph: "@", code: "02" },
  { id: "network", label: "Réseau", glyph: "⌁", code: "03" },
  { id: "terminal", label: "Terminal", glyph: ">_", code: "04" },
  { id: "files", label: "Fichiers", glyph: "□", code: "05" },
  { id: "timeline", label: "Timeline", glyph: "⌇", code: "06" },
];

const judyPortrait =
  "https://1.bp.blogspot.com/-YF9OOw5rB-U/X9tAimobl0I/AAAAAAAAGEU/t1PHyHLWS_sz09PM7YustUT6GJJDsaKbACPcBGAsYHg/w914-h514-p-k-no-nu/judy-alvarez-cyberpunk-2077-uhdpaper.com-4K-8.2294-wp.thumbnail.jpg";

export function InvestigationDesktop({ caseId }: { caseId: string }) {
  const [activeApp, setActiveApp] = useState<ActiveApp>("case");
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0].id);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [signals, setSignals] = useState<PhishingSignal[]>([]);
  const [notebookTab, setNotebookTab] = useState<NotebookTab>("evidence");
  const [notesOpen, setNotesOpen] = useState(true);
  const [progress, setProgress] =
    useState<InvestigationProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 1,
      output: "TRACE forensic shell / simulated environment / read only",
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

  function openApp(app: ActiveApp) {
    setActiveApp(app);
    setAnnouncement(`${dockApps.find((item) => item.id === app)?.label} ouvert.`);
  }

  function startInvestigation() {
    openApp("mail");
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
      setAnnouncement("Ce message ne révèle pas suffisamment d'indices.");
      return;
    }

    const result = analyzePhishingSignals(signals);

    if (!result.isEnough) {
      setAnnouncement("Analyse incomplète. Deux indices minimum.");
      return;
    }

    addEvidence(result.evidenceIds);
    setNotebookTab("evidence");
    setNotesOpen(true);
    setAnnouncement("E01 et E02 ajoutées au carnet.");
  }

  function validateHypothesis() {
    if (!hasPhishingEvidence || hypothesisValidated) return;

    setProgress((current) => ({
      ...current,
      validatedHypothesisIds: [...current.validatedHypothesisIds, "H01"],
    }));
    setAnnouncement("H01 validée. Le réseau devient prioritaire.");
  }

  function compareSessions() {
    addEvidence(["E03", "E04"]);
    setNotebookTab("evidence");
    setNotesOpen(true);
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
      setNotesOpen(true);
      setAnnouncement(
        `${result.evidenceIds.join(" + ")} ajoutée(s) au carnet.`,
      );
    }
  }

  function renderCase() {
    return (
      <section className="personal-home" aria-labelledby="case-brief-title">
        <div className="personal-home__identity">
          <div className="personal-home__portrait">
            <img src={judyPortrait} alt="" />
          </div>

          <div className="personal-home__copy">
            <span className="micro-label">USER PROFILE / LOCAL DEVICE</span>
            <h2 id="case-brief-title">Judy Alvarez</h2>
            <p>
              Dernière activité locale détectée à 22:44. Le poste est figé dans
              une copie forensic en lecture seule.
            </p>

            <div className="identity-stats">
              <div>
                <span>DEVICE</span>
                <strong>JUDY-LAPTOP</strong>
              </div>
              <div>
                <span>PROJECT</span>
                <strong>ORION</strong>
              </div>
              <div>
                <span>STATE</span>
                <strong>OFFLINE / 36H</strong>
              </div>
            </div>

            <button className="soft-button" type="button" onClick={startInvestigation}>
              Commencer par les messages
            </button>
          </div>
        </div>

        <div className="personal-home__cards">
          <article>
            <span className="micro-label">RECENT</span>
            <strong>6 messages</strong>
            <p>Dernière réception · 22:18</p>
          </article>
          <article>
            <span className="micro-label">SESSION</span>
            <strong>S-4831</strong>
            <p>Dernier jeton actif</p>
          </article>
          <article>
            <span className="micro-label">INTEGRITY</span>
            <strong>VERIFIED</strong>
            <p>Image disque en lecture seule</p>
          </article>
        </div>
      </section>
    );
  }

  function renderMail() {
    return (
      <section className="mail-space" aria-labelledby="mail-subject">
        <aside className="mail-space__sidebar" aria-label="Boîte de réception">
          <div className="space-sidebar__heading">
            <span className="micro-label">MAIL</span>
            <strong>Messages</strong>
            <small>{emails.length} éléments</small>
          </div>

          <div className="mail-space__list">
            {emails.map((email) => (
              <button
                className="mail-space__item"
                data-active={email.id === selectedEmail.id}
                key={email.id}
                onClick={() => {
                  setSelectedEmailId(email.id);
                  setAnalysisOpen(false);
                  setSignals([]);
                }}
                type="button"
              >
                <span className="mail-space__avatar" aria-hidden="true">
                  {email.from.slice(0, 1).toUpperCase()}
                </span>
                <span className="mail-space__item-copy">
                  <strong>{email.subject}</strong>
                  <small>{email.from}</small>
                </span>
                <time>{email.date.split("·")[1]?.trim() ?? email.date}</time>
              </button>
            ))}
          </div>
        </aside>

        <article className="mail-space__reader">
          <header className="mail-space__reader-header">
            <div>
              <span className="micro-label">{selectedEmail.date}</span>
              <h2 id="mail-subject">{selectedEmail.subject}</h2>
            </div>
            {selectedEmail.external ? (
              <span className="status-pill">EXTERNAL</span>
            ) : null}
          </header>

          <dl className="mail-space__meta">
            <div><dt>From</dt><dd>{selectedEmail.from}</dd></div>
            <div><dt>To</dt><dd>{selectedEmail.to}</dd></div>
          </dl>

          <div className="mail-space__body">
            {selectedEmail.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {selectedEmail.displayLink ? (
              <div className="link-inspector">
                <span className="micro-label">LINK INSPECTOR</span>
                <div>
                  <span>displayed</span>
                  <strong>{selectedEmail.displayLink}</strong>
                </div>
                <div>
                  <span>resolved</span>
                  <code>{selectedEmail.actualLink}</code>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mail-space__toolbar">
            <button
              className="soft-button"
              type="button"
              onClick={() => setAnalysisOpen((open) => !open)}
              aria-expanded={analysisOpen}
              aria-controls="analysis-panel"
            >
              Analyser ce message
            </button>
            <button className="ghost-button" type="button" onClick={() => setNotesOpen(true)}>
              Ouvrir le carnet
            </button>
          </div>

          {analysisOpen ? (
            <section
              className="analysis-sheet"
              id="analysis-panel"
              aria-labelledby="analysis-title"
            >
              <header>
                <div>
                  <span className="micro-label">FORENSIC ASSIST</span>
                  <h3 id="analysis-title">Qu’est-ce qui cloche ?</h3>
                </div>
                <span>{signals.length}/4</span>
              </header>

              <fieldset>
                <legend className="sr-only">Indices observés</legend>
                {(Object.entries(signalLabels) as [PhishingSignal, string][]).map(
                  ([signal, label]) => (
                    <label key={signal} className="analysis-choice">
                      <input
                        checked={signals.includes(signal)}
                        onChange={() => toggleSignal(signal)}
                        type="checkbox"
                      />
                      <span>{label}</span>
                    </label>
                  ),
                )}
              </fieldset>

              <button className="soft-button" type="button" onClick={validateAnalysis}>
                Valider l’analyse
              </button>
            </section>
          ) : null}
        </article>
      </section>
    );
  }

  function renderNetwork() {
    if (!hypothesisValidated) {
      return (
        <section className="empty-app">
          <span className="micro-label">NETWORK</span>
          <h2>Le contexte manque.</h2>
          <p>Validez d’abord H01 dans le carnet pour interpréter ces sessions.</p>
          <button className="soft-button" type="button" onClick={() => {
            setNotebookTab("hypotheses");
            setNotesOpen(true);
          }}>
            Ouvrir les hypothèses
          </button>
        </section>
      );
    }

    return (
      <section className="network-space" aria-labelledby="network-title">
        <header className="app-heading">
          <div>
            <span className="micro-label">AUTHENTICATION TRACE</span>
            <h2 id="network-title">Session S-4831</h2>
          </div>
          <span className="status-pill status-pill--warning">2 DEVICES</span>
        </header>

        <div className="session-map" aria-label="Comparaison des sessions">
          <article className="session-node">
            <span className="micro-label">KNOWN DEVICE</span>
            <strong>JUDY-LAPTOP</strong>
            <small>10.24.16.12</small>
          </article>
          <div className="session-link" aria-hidden="true">
            <span>S-4831</span>
          </div>
          <article className="session-node session-node--unknown">
            <span className="micro-label">UNKNOWN DEVICE</span>
            <strong>UNKNOWN-WIN</strong>
            <small>198.51.100.73</small>
          </article>
        </div>

        <div className="event-stream" role="table" aria-label="Événements de session">
          {sessionEvents.map((event) => (
            <div className="event-stream__row" role="row" key={event.id}>
              <time role="cell">{event.time}</time>
              <span role="cell">{event.device}</span>
              <span role="cell">{event.ip}</span>
              <strong role="cell">{event.event}</strong>
            </div>
          ))}
        </div>

        <button className="soft-button" type="button" onClick={compareSessions}>
          Comparer les sessions
        </button>
      </section>
    );
  }

  function renderTerminal() {
    if (!hasNetworkEvidence) {
      return (
        <section className="empty-app">
          <span className="micro-label">TERMINAL</span>
          <h2>Shell verrouillé.</h2>
          <p>Confirmez d’abord l’anomalie de session dans Réseau.</p>
          <button className="soft-button" type="button" onClick={() => openApp("network")}>
            Ouvrir Réseau
          </button>
        </section>
      );
    }

    return (
      <section className="terminal-space" aria-labelledby="terminal-title">
        <header className="app-heading">
          <div>
            <span className="micro-label">SIMULATED SHELL / READ ONLY</span>
            <h2 id="terminal-title">Terminal</h2>
          </div>
        </header>

        <div className="terminal-space__screen" aria-live="polite">
          {terminalLines.map((line) =>
            line.command ? (
              <p key={line.id} className="terminal-command">
                <span>judy@trace ~ %</span> {line.command}
              </p>
            ) : (
              <p key={line.id}>{line.output}</p>
            ),
          )}
        </div>

        <form className="terminal-space__form" onSubmit={submitTerminal}>
          <label htmlFor="terminal-command">judy@trace ~ %</label>
          <input
            id="terminal-command"
            value={terminalInput}
            onChange={(event) => setTerminalInput(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="terminal-hint"
          />
          <button type="submit">Run</button>
        </form>

        <p id="terminal-hint" className="terminal-hint">
          Essayez <code>help</code>, puis <code>ls</code>.
        </p>
      </section>
    );
  }

  function renderPlaceholder(title: string) {
    return (
      <section className="empty-app">
        <span className="micro-label">APP</span>
        <h2>{title}</h2>
        <p>Cette application n’est pas encore nécessaire pour cette enquête.</p>
      </section>
    );
  }

  function renderActiveWindow() {
    if (activeApp === "case") return renderCase();
    if (activeApp === "mail") return renderMail();
    if (activeApp === "network") return renderNetwork();
    if (activeApp === "terminal") return renderTerminal();
    if (activeApp === "files") return renderPlaceholder("Fichiers");
    return renderPlaceholder("Timeline");
  }

  const activeMeta = dockApps.find((app) => app.id === activeApp) ?? dockApps[0];

  return (
    <main className="judy-os" id="main-content">
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <img className="judy-os__wallpaper" src={judyPortrait} alt="" aria-hidden="true" />
      <div className="judy-os__veil" aria-hidden="true" />

      <header className="os-menubar">
        <div className="os-menubar__left">
          <span className="os-mark" aria-hidden="true">TZ</span>
          <strong>JUDY-LAPTOP</strong>
          <span>forensic mirror</span>
        </div>
        <div className="os-menubar__center">
          <span>case {caseId}</span>
          <span>read only</span>
        </div>
        <div className="os-menubar__right">
          <button
            type="button"
            className="notes-toggle"
            aria-pressed={notesOpen}
            onClick={() => setNotesOpen((open) => !open)}
          >
            Notes {progress.discoveredEvidenceIds.length}/6
          </button>
          <span className="os-status-dot" aria-hidden="true" />
        </div>
      </header>

      <section className="os-stage" aria-label="Bureau de Judy">
        <div className="window-stack">
          <div className="app-window" data-app={activeApp}>
            <header className="app-window__chrome">
              <div className="window-controls" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="app-window__identity">
                <span>{activeMeta.glyph}</span>
                <strong>{activeMeta.label}</strong>
              </div>
              <span className="app-window__code">{activeMeta.code}</span>
            </header>

            <div className="app-window__body">{renderActiveWindow()}</div>
          </div>

          <aside className="profile-float" aria-label="Profil utilisateur">
            <img src={judyPortrait} alt="" />
            <div>
              <span className="micro-label">OWNER</span>
              <strong>Judy Alvarez</strong>
              <small>last seen 36h ago</small>
            </div>
          </aside>

          <button
            className="desktop-artifact desktop-artifact--file"
            type="button"
            onClick={() => openApp("files")}
          >
            <span className="desktop-artifact__icon" aria-hidden="true">□</span>
            <span>
              <small>RECENT FILE</small>
              <strong>orion-export.zip</strong>
              <em>22:43 · 418 MB</em>
            </span>
          </button>

          <button
            className="desktop-artifact desktop-artifact--memo"
            type="button"
            onClick={() => openApp("mail")}
          >
            <span className="desktop-artifact__icon" aria-hidden="true">@</span>
            <span>
              <small>UNREAD</small>
              <strong>security@helix-support</strong>
              <em>session ORION expirée</em>
            </span>
          </button>

          {notesOpen ? (
            <aside className="notes-inspector" aria-labelledby="notebook-title">
              <header className="notes-inspector__header">
                <div>
                  <span className="micro-label">CASE MEMORY</span>
                  <strong id="notebook-title">Carnet</strong>
                </div>
                <button type="button" onClick={() => setNotesOpen(false)} aria-label="Fermer le carnet">
                  ×
                </button>
              </header>

              <div className="notes-tabs" role="tablist" aria-label="Carnet">
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
                  Hypothèse
                </button>
              </div>

              {notebookTab === "evidence" ? (
                <div className="notes-list" role="tabpanel">
                  {progress.discoveredEvidenceIds.length === 0 ? (
                    <p className="notes-empty">Aucune preuve vérifiée.</p>
                  ) : (
                    progress.discoveredEvidenceIds.map((id) => {
                      const evidence = evidenceCatalog[id];
                      if (!evidence) return null;
                      return (
                        <article className="note-card" key={id}>
                          <span>{evidence.id}</span>
                          <strong>{evidence.title}</strong>
                          <p>{evidence.description}</p>
                        </article>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="notes-list" role="tabpanel">
                  <article className="note-card note-card--hypothesis">
                    <span>H01</span>
                    <strong>Phishing ciblé</strong>
                    <p>
                      Judy a reçu un message conçu pour capturer sa session ORION.
                    </p>
                    <button
                      className="soft-button soft-button--small"
                      disabled={!hasPhishingEvidence || hypothesisValidated}
                      onClick={validateHypothesis}
                      type="button"
                    >
                      {hypothesisValidated ? "Hypothèse validée" : "Valider la conclusion"}
                    </button>
                  </article>
                </div>
              )}
            </aside>
          ) : null}
        </div>
      </section>

      <nav className="os-dock" aria-label="Applications de Judy">
        {dockApps.map((app) => (
          <button
            aria-label={app.label}
            aria-pressed={activeApp === app.id}
            className="dock-app"
            data-active={activeApp === app.id}
            key={app.id}
            onClick={() => openApp(app.id)}
            type="button"
          >
            <span className="dock-app__glyph" aria-hidden="true">{app.glyph}</span>
            <span className="dock-app__label">{app.label}</span>
          </button>
        ))}
      </nav>

      <footer className="os-footnote">
        TRACE//ZERO · forensic copy · no live system access
      </footer>
    </main>
  );
}
