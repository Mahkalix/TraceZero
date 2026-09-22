"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
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

type WindowKey = ActiveApp | "notes";
type NotebookTab = "evidence" | "hypotheses";

type WindowPosition = { x: number; y: number };

type DragSession = {
  key: WindowKey;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  nextX: number;
  nextY: number;
  raf: number | null;
};

type TerminalLine = {
  id: number;
  command?: string;
  output?: string;
};

const judyPortrait =
  "https://1.bp.blogspot.com/-YF9OOw5rB-U/X9tAimobl0I/AAAAAAAAGEU/t1PHyHLWS_sz09PM7YustUT6GJJDsaKbACPcBGAsYHg/w914-h514-p-k-no-nu/judy-alvarez-cyberpunk-2077-uhdpaper.com-4K-8.2294-wp.thumbnail.jpg";
const judyWallpaper = "/judy-apartment.jpg";

const apps: Array<{
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

const defaultWindowPositions: Record<WindowKey, WindowPosition> = {
  case: { x: 0, y: 0 },
  mail: { x: 54, y: 22 },
  network: { x: 92, y: 42 },
  terminal: { x: 124, y: 64 },
  files: { x: 78, y: 34 },
  timeline: { x: 108, y: 54 },
  notes: { x: 0, y: 0 },
};

const signalLabels: Record<PhishingSignal, string> = {
  sender: "expéditeur externe",
  domain: "domaine ressemblant",
  link: "destination réelle différente",
  urgency: "pression temporelle",
};

export function InvestigationDesktop({ caseId }: { caseId: string }) {
  const [openApps, setOpenApps] = useState<ActiveApp[]>(["case"]);
  const [minimizedApps, setMinimizedApps] = useState<ActiveApp[]>([]);
  const [activeApp, setActiveApp] = useState<ActiveApp>("case");
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0].id);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [signals, setSignals] = useState<PhishingSignal[]>([]);
  const [notebookTab, setNotebookTab] = useState<NotebookTab>("evidence");
  const [notesOpen, setNotesOpen] = useState(false);
  const [progress, setProgress] =
    useState<InvestigationProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [windowPositions, setWindowPositions] =
    useState<Record<WindowKey, WindowPosition>>(defaultWindowPositions);
  const [windowLayers, setWindowLayers] = useState<Record<WindowKey, number>>({
    case: 5,
    mail: 6,
    network: 7,
    terminal: 8,
    files: 9,
    timeline: 10,
    notes: 20,
  });
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 1,
      output: "TRACE forensic shell / simulated environment / read only",
    },
  ]);

  const windowRefs = useRef<Partial<Record<WindowKey, HTMLElement | null>>>({});
  const dragRef = useRef<DragSession | null>(null);
  const topLayerRef = useRef(20);

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
  const hasArchiveEvidence = discovered.has("E05");
  const hasHashEvidence = discovered.has("E06");
  const hypothesisValidated = progress.validatedHypothesisIds.includes("H01");
  const caseComplete = hasHashEvidence;

  function focusWindow(key: WindowKey) {
    topLayerRef.current += 1;
    const layer = topLayerRef.current;
    setWindowLayers((current) => ({ ...current, [key]: layer }));

    if (key !== "notes") setActiveApp(key);
  }

  function openApp(app: ActiveApp) {
    setOpenApps((current) =>
      current.includes(app) ? current : [...current, app],
    );
    setMinimizedApps((current) => current.filter((item) => item !== app));
    focusWindow(app);
    setAnnouncement(`${apps.find((item) => item.id === app)?.label} ouvert.`);
  }

  function minimizeApp(app: ActiveApp) {
    setMinimizedApps((current) =>
      current.includes(app) ? current : [...current, app],
    );
    setAnnouncement(`${apps.find((item) => item.id === app)?.label} réduit.`);
  }

  function closeApp(app: ActiveApp) {
    if (app === "case") {
      minimizeApp(app);
      return;
    }

    setOpenApps((current) => current.filter((item) => item !== app));
    setMinimizedApps((current) => current.filter((item) => item !== app));
  }

  function resetDesktopLayout() {
    setWindowPositions(defaultWindowPositions);
    setOpenApps(["case"]);
    setMinimizedApps([]);
    setNotesOpen(false);
    setActiveApp("case");
    topLayerRef.current = 20;

    Object.entries(defaultWindowPositions).forEach(([key, position]) => {
      const element = windowRefs.current[key as WindowKey];
      if (element) {
        element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      }
    });

    setAnnouncement("Bureau remis en place.");
  }

  function clampPosition(position: WindowPosition) {
    if (typeof window === "undefined") return position;

    const xLimit = Math.max(120, Math.round(window.innerWidth * 0.34));
    const yLimit = Math.max(90, Math.round(window.innerHeight * 0.24));

    return {
      x: Math.max(-xLimit, Math.min(xLimit, position.x)),
      y: Math.max(-yLimit, Math.min(yLimit, position.y)),
    };
  }

  function paintWindowPosition(key: WindowKey, position: WindowPosition) {
    const element = windowRefs.current[key];
    if (element) {
      element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    }
  }

  function beginWindowDrag(
    key: WindowKey,
    event: PointerEvent<HTMLElement>,
  ) {
    if (event.button !== 0 || window.matchMedia("(max-width: 58rem)").matches) {
      return;
    }

    focusWindow(key);
    event.currentTarget.setPointerCapture(event.pointerId);
    const origin = windowPositions[key];

    dragRef.current = {
      key,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      nextX: origin.x,
      nextY: origin.y,
      raf: null,
    };
  }

  function moveWindowDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const next = clampPosition({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });

    drag.nextX = next.x;
    drag.nextY = next.y;

    if (drag.raf !== null) return;

    drag.raf = window.requestAnimationFrame(() => {
      const current = dragRef.current;
      if (!current) return;
      paintWindowPosition(current.key, {
        x: current.nextX,
        y: current.nextY,
      });
      current.raf = null;
    });
  }

  function endWindowDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.raf !== null) {
      window.cancelAnimationFrame(drag.raf);
      paintWindowPosition(drag.key, { x: drag.nextX, y: drag.nextY });
    }

    setWindowPositions((current) => ({
      ...current,
      [drag.key]: { x: drag.nextX, y: drag.nextY },
    }));

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
  }

  function moveWindowWithKeyboard(
    key: WindowKey,
    event: KeyboardEvent<HTMLElement>,
  ) {
    const vector: Record<string, WindowPosition> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };

    const direction = vector[event.key];
    if (!direction) return;

    event.preventDefault();
    focusWindow(key);
    const step = event.shiftKey ? 48 : 16;
    const current = windowPositions[key];
    const next = clampPosition({
      x: current.x + direction.x * step,
      y: current.y + direction.y * step,
    });

    setWindowPositions((positions) => ({ ...positions, [key]: next }));
    paintWindowPosition(key, next);
  }

  function addEvidence(ids: string[]) {
    setProgress((current) => ({
      ...current,
      discoveredEvidenceIds: [
        ...new Set([...current.discoveredEvidenceIds, ...ids]),
      ],
    }));
  }

  function startInvestigation() {
    openApp("mail");
    setProgress((current) => ({ ...current, currentStep: "mail" }));
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
      setAnnouncement("Rien de suffisamment anormal sur ce message.");
      return;
    }

    const result = analyzePhishingSignals(signals);

    if (!result.isEnough) {
      setAnnouncement("Deux indices sont nécessaires.");
      return;
    }

    addEvidence(result.evidenceIds);
    setNotebookTab("evidence");
    setNotesOpen(true);
    focusWindow("notes");
    setAnnouncement("Deux preuves ont été ajoutées au carnet.");
  }

  function validateHypothesis() {
    if (!hasPhishingEvidence || hypothesisValidated) return;

    setProgress((current) => ({
      ...current,
      validatedHypothesisIds: [...current.validatedHypothesisIds, "H01"],
    }));
    setAnnouncement("Phishing ciblé confirmé. Vérifiez maintenant le réseau.");
    openApp("network");
  }

  function compareSessions() {
    addEvidence(["E03", "E04"]);
    setNotebookTab("evidence");
    setNotesOpen(true);
    focusWindow("notes");
    setAnnouncement("La session de Judy a été réutilisée sur une autre machine.");
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
      return [
        ...current,
        { id: nextId, command },
        ...result.output.map((output, index) => ({
          id: nextId + index + 1,
          output,
        })),
      ];
    });

    if (result.evidenceIds?.length) {
      addEvidence(result.evidenceIds);
      setNotebookTab("evidence");
      setNotesOpen(true);
      setAnnouncement(
        result.evidenceIds.includes("E06")
          ? "Empreinte divergente confirmée. Le dossier peut être consolidé."
          : "Archive ORION identifiée.",
      );
    }
  }

  function renderCase() {
    return (
      <section className="case-home" aria-labelledby="case-title">
        <div className="case-home__portrait">
          <img src={judyPortrait} alt="" />
        </div>

        <div className="case-home__content">
          <span className="micro-label">
            {caseComplete ? "CASE 001 / TRACE COMPLETE" : "CASE 001 / START HERE"}
          </span>
          <h2 id="case-title">Judy Alvarez</h2>

          {caseComplete ? (
            <>
              <p>
                La compromission est établie : phishing ciblé, réutilisation de
                session puis export ORION dont l’empreinte ne correspond pas à
                la référence de Judy.
              </p>
              <div className="case-result">
                <span>6 preuves vérifiées</span>
                <strong>Piste technique consolidée</strong>
              </div>
              <button className="soft-button" type="button" onClick={() => openApp("timeline")}>
                Voir la chronologie
              </button>
            </>
          ) : (
            <>
              <p>
                Judy a disparu il y a 36 heures. Commencez simplement par
                regarder ses derniers messages.
              </p>
              <div className="case-home__meta">
                <span>Dernière activité · 22:44</span>
                <span>Copie en lecture seule</span>
              </div>
              <button className="soft-button" type="button" onClick={startInvestigation}>
                Ouvrir Messages
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  function renderMail() {
    return (
      <section className="mail-space" aria-labelledby="mail-subject">
        <aside className="mail-space__sidebar" aria-label="Boîte de réception">
          <div className="space-sidebar__heading">
            <strong>Messages</strong>
            <small>{emails.length} conversations</small>
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
            {selectedEmail.external ? <span className="status-pill">EXTERNAL</span> : null}
          </header>

          <dl className="mail-space__meta">
            <div><dt>De</dt><dd>{selectedEmail.from}</dd></div>
            <div><dt>À</dt><dd>{selectedEmail.to}</dd></div>
          </dl>

          <div className="mail-space__body">
            {selectedEmail.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

            {selectedEmail.displayLink ? (
              <div className="link-inspector">
                <span className="micro-label">Lien détecté</span>
                <div><span>affiché</span><strong>{selectedEmail.displayLink}</strong></div>
                <div><span>réel</span><code>{selectedEmail.actualLink}</code></div>
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
          </div>

          {analysisOpen ? (
            <section className="analysis-sheet" id="analysis-panel" aria-labelledby="analysis-title">
              <header>
                <div>
                  <span className="micro-label">Analyse</span>
                  <h3 id="analysis-title">Quels signaux sont suspects ?</h3>
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
          <span className="micro-label">Réseau</span>
          <h2>Pas encore.</h2>
          <p>Le réseau ne devient pertinent qu’après avoir confirmé l’hypothèse de phishing.</p>
          <button
            className="soft-button"
            type="button"
            onClick={() => {
              setNotebookTab("hypotheses");
              setNotesOpen(true);
              focusWindow("notes");
            }}
          >
            Ouvrir l’hypothèse
          </button>
        </section>
      );
    }

    return (
      <section className="network-space" aria-labelledby="network-title">
        <header className="app-heading">
          <div>
            <span className="micro-label">Session d’authentification</span>
            <h2 id="network-title">S-4831</h2>
          </div>
          <span className="status-pill status-pill--warning">2 appareils</span>
        </header>

        <div className="session-map">
          <article className="session-node">
            <span className="micro-label">Connu</span>
            <strong>JUDY-LAPTOP</strong>
            <small>10.24.16.12</small>
          </article>
          <div className="session-link"><span>S-4831</span></div>
          <article className="session-node session-node--unknown">
            <span className="micro-label">Inconnu</span>
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
          Confirmer l’anomalie
        </button>
      </section>
    );
  }

  function renderTerminal() {
    if (!hasNetworkEvidence) {
      return (
        <section className="empty-app">
          <span className="micro-label">Terminal</span>
          <h2>Shell verrouillé.</h2>
          <p>Confirmez l’anomalie réseau avant de fouiller les fichiers.</p>
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
            <span className="micro-label">Sandbox / lecture seule</span>
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
          Commencez par <code>help</code>, puis <code>ls</code>.
        </p>
      </section>
    );
  }

  function renderFiles() {
    const rows = [
      { name: "notes.txt", meta: "1 KB · texte" },
      { name: "reference.sha256", meta: "96 B · empreinte" },
      { name: "orion-export.zip", meta: "418 MB · archive", suspect: true },
      { name: "auth.log", meta: "24 KB · journal" },
    ];

    return (
      <section className="files-space" aria-labelledby="files-title">
        <header className="app-heading">
          <div>
            <span className="micro-label">Récents</span>
            <h2 id="files-title">Fichiers</h2>
          </div>
        </header>

        <div className="file-list">
          {rows.map((row) => (
            <button
              className="file-row"
              data-suspect={row.suspect || undefined}
              key={row.name}
              type="button"
              onClick={() => {
                if (row.name === "orion-export.zip") openApp("terminal");
              }}
            >
              <span className="file-row__icon" aria-hidden="true">□</span>
              <strong>{row.name}</strong>
              <small>{row.meta}</small>
              {row.suspect ? <em>{hasArchiveEvidence ? "identifiée" : "à vérifier"}</em> : null}
            </button>
          ))}
        </div>

        <p className="files-hint">
          L’archive ORION mérite une vérification d’intégrité dans le Terminal.
        </p>
      </section>
    );
  }

  function renderTimeline() {
    const items = [
      { time: "21:36", title: "Dernière présence confirmée", detail: "Judy quitte Helix Systems.", active: true },
      { time: "22:18", title: "Message externe reçu", detail: "Alerte de sécurité ORION.", active: hasPhishingEvidence },
      { time: "22:44", title: "Session S-4831 réutilisée", detail: "UNKNOWN-WIN reprend le jeton.", active: hasNetworkEvidence },
      { time: "22:45", title: "Export ORION téléchargé", detail: "orion-export.zip apparaît sur le poste.", active: hasArchiveEvidence },
      { time: "22:46", title: "Empreinte divergente", detail: "Le SHA-256 ne correspond pas à la référence.", active: hasHashEvidence },
    ];

    return (
      <section className="timeline-space" aria-labelledby="timeline-title">
        <header className="app-heading">
          <div>
            <span className="micro-label">Reconstruction</span>
            <h2 id="timeline-title">Timeline</h2>
          </div>
        </header>

        <ol className="timeline-list">
          {items.map((item) => (
            <li data-active={item.active} key={item.time + item.title}>
              <time>{item.time}</time>
              <div>
                <strong>{item.title}</strong>
                <p>{item.active ? item.detail : "Non vérifié"}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  function renderApp(app: ActiveApp) {
    if (app === "case") return renderCase();
    if (app === "mail") return renderMail();
    if (app === "network") return renderNetwork();
    if (app === "terminal") return renderTerminal();
    if (app === "files") return renderFiles();
    return renderTimeline();
  }

  function renderWindow(app: ActiveApp) {
    const meta = apps.find((item) => item.id === app) ?? apps[0];
    const position = windowPositions[app];
    const minimized = minimizedApps.includes(app);

    if (minimized) return null;

    return (
      <div
        className="app-window draggable-window"
        data-app={app}
        key={app}
        ref={(node) => { windowRefs.current[app] = node; }}
        onPointerDown={() => focusWindow(app)}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          zIndex: windowLayers[app],
        }}
      >
        <header
          className="app-window__chrome window-drag-handle"
          tabIndex={0}
          aria-label={`Déplacer la fenêtre ${meta.label}. Flèches du clavier disponibles.`}
          onPointerDown={(event) => beginWindowDrag(app, event)}
          onPointerMove={moveWindowDrag}
          onPointerUp={endWindowDrag}
          onPointerCancel={endWindowDrag}
          onKeyDown={(event) => moveWindowWithKeyboard(app, event)}
        >
          <div className="window-controls">
            <button
              type="button"
              aria-label={`Fermer ${meta.label}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => closeApp(app)}
            />
            <button
              type="button"
              aria-label={`Réduire ${meta.label}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => minimizeApp(app)}
            />
            <span aria-hidden="true" />
          </div>
          <div className="app-window__identity">
            <span>{meta.glyph}</span>
            <strong>{meta.label}</strong>
          </div>
          <span className="app-window__code">{meta.code}</span>
        </header>
        <div className="app-window__body">{renderApp(app)}</div>
      </div>
    );
  }

  return (
    <main className="judy-os" id="main-content">
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <img className="judy-os__wallpaper" src={judyWallpaper} alt="" aria-hidden="true" />
      <div className="judy-os__veil" aria-hidden="true" />

      <header className="os-menubar">
        <div className="os-menubar__left">
          <span className="os-mark" aria-hidden="true">TZ</span>
          <strong>JUDY-LAPTOP</strong>
        </div>
        <div className="os-menubar__center">
          <span>{caseComplete ? "trace complete" : "case 001"}</span>
        </div>
        <div className="os-menubar__right">
          <button className="layout-reset" type="button" onClick={resetDesktopLayout}>
            Ranger
          </button>
          <button
            type="button"
            className="notes-toggle"
            aria-pressed={notesOpen}
            onClick={() => {
              setNotesOpen((open) => !open);
              if (!notesOpen) focusWindow("notes");
            }}
          >
            Carnet {progress.discoveredEvidenceIds.length}/6
          </button>
          <span className="os-status-dot" aria-hidden="true" />
        </div>
      </header>

      <section className="os-stage" aria-label="Bureau de Judy">
        <div className="window-stack">
          {openApps.map(renderWindow)}

          {notesOpen ? (
            <aside
              className="notes-inspector draggable-window"
              aria-labelledby="notebook-title"
              ref={(node) => { windowRefs.current.notes = node; }}
              onPointerDown={() => focusWindow("notes")}
              style={{
                transform: `translate3d(${windowPositions.notes.x}px, ${windowPositions.notes.y}px, 0)`,
                zIndex: windowLayers.notes,
              }}
            >
              <header
                className="notes-inspector__header window-drag-handle"
                tabIndex={0}
                aria-label="Déplacer le carnet. Flèches du clavier disponibles."
                onPointerDown={(event) => beginWindowDrag("notes", event)}
                onPointerMove={moveWindowDrag}
                onPointerUp={endWindowDrag}
                onPointerCancel={endWindowDrag}
                onKeyDown={(event) => moveWindowWithKeyboard("notes", event)}
              >
                <div>
                  <span className="micro-label">Mémoire du dossier</span>
                  <strong id="notebook-title">Carnet</strong>
                </div>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setNotesOpen(false)}
                  aria-label="Fermer le carnet"
                >
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
                    <p className="notes-empty">Aucune preuve pour l’instant.</p>
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
                    <p>Le message externe a servi à capturer la session ORION de Judy.</p>
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
        {apps.map((app) => {
          const isOpen = openApps.includes(app.id) && !minimizedApps.includes(app.id);
          return (
            <button
              aria-label={app.label}
              aria-pressed={isOpen}
              className="dock-app"
              data-active={activeApp === app.id && isOpen}
              data-open={isOpen}
              key={app.id}
              onClick={() => openApp(app.id)}
              type="button"
            >
              <span className="dock-app__glyph" aria-hidden="true">{app.glyph}</span>
              <span className="dock-app__label">{app.label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}
