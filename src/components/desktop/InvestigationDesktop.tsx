"use client";
import Link from "next/link";
import { PlayerGuide } from "./PlayerGuide";
import { SystemStatus } from "./SystemStatus";
import { AudioControl } from "./SiteAudio";

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
import { storyClues, storyClueIds, type StoryClueId } from "@/data/chapter-01/story";
import {
  analyzePhishingSignals,
  type PhishingSignal,
} from "@/features/investigation/phishing";
import {
  initialProgress,
  isCaseComplete,
  readProgress,
  writeProgress,
  type InvestigationProgress,
} from "@/features/investigation/progress";
import { runTerminalCommand } from "@/features/investigation/terminal";
import { notebookState } from "@/features/investigation/notebook";

type ActiveApp =
  | "case"
  | "mail"
  | "network"
  | "terminal"
  | "files"
  | "timeline";

type WindowKey = ActiveApp | "notes";
type NotebookTab = "leads" | "evidence" | "hypotheses";

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

const judyWallpaper = "/forensic-workstation.webp";

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
  const [analysisFeedback, setAnalysisFeedback] = useState<{ kind: "error" | "success" | "info"; message: string; details?: string[]; attempt: number } | null>(null);
  const analysisFeedbackRef = useRef<HTMLDivElement>(null);
  const [signals, setSignals] = useState<PhishingSignal[]>([]);
  const [notebookTab, setNotebookTab] = useState<NotebookTab>("leads");
  const [notesOpen, setNotesOpen] = useState(false);
  const [progress, setProgress] =
    useState<InvestigationProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [restartPending, setRestartPending] = useState(false);
  const [maximizedApp, setMaximizedApp] = useState<ActiveApp | null>(null);
  const [clock, setClock] = useState("Session locale");
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
    const update = () => setClock(new Intl.DateTimeFormat("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date()));
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) setSaveFailed(!writeProgress(progress));
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
  const caseComplete = isCaseComplete(progress);
  const notebook = notebookState(progress);
  const nextStoryClue = storyClueIds.find((id) => !progress.storyClueIds?.includes(id));
  const selectedStoryClue = storyClues[selectedEmail.id as StoryClueId];
  const lead = caseComplete
    ? { question: "Qu’est-ce que cette soirée nous apprend ?", action: "Lire la conclusion", hint: "Les passages et les traces sont réunis. Retourne au dossier pour faire le point." }
    : nextStoryClue
      ? { question: ({ "draft-max": "Pourquoi Judy me demandait-elle de la couvrir ?", "mail-003": "Que savait Nora ce soir-là ?", "mail-departure": "Quand Judy est-elle vraiment partie ?", "mail-sent": "Qui a écrit le dernier message de Judy ?" })[nextStoryClue], action: "Suivre cette piste", hint: "Lis le passage, puis garde-le dans ton carnet. Le bouton suivant ouvre l’échange à recouper. Tu peux aussi explorer librement les autres messages." }
      : !hasPhishingEvidence
        ? { question: "Comment quelqu’un aurait-il pu accéder au compte de Judy ?", action: "Examiner l’alerte reçue", hint: "Ouvre l’analyse de l’alerte de 21 h 52. Compare les domaines du lien et cherche ce qui pousse Judy à agir vite. Les autres mails ne sont pas des étapes obligatoires à valider." }
        : !hypothesisValidated
          ? { question: "L’alerte pouvait-elle servir à piéger Judy ?", action: "Relier les indices dans le carnet", hint: "Dans l’onglet Hypothèse du carnet, valide la conclusion appuyée par les deux preuves. Cela ouvre les connexions." }
          : !hasNetworkEvidence
            ? { question: "Une autre machine utilisait-elle sa session ?", action: "Comparer les connexions", hint: "Compare l’identifiant de session et les deux appareils, puis clique sur Confirmer l’anomalie." }
            : { question: "L’archive est-elle encore celle que Judy avait conservée ?", action: "Vérifier l’archive", hint: "Lis notes.txt dans Fichiers. Dans le terminal, saisis sha256sum orion-export.zip puis Entrée pour comparer le fichier à la référence de Judy." };

  function followLead() {
    setNotesOpen(false);
    if (caseComplete) openApp("case");
    else if (nextStoryClue) selectMessage(nextStoryClue);
    else if (!hasPhishingEvidence) { selectMessage(phishingEmailId); setAnalysisOpen(true); }
    else if (!hypothesisValidated) { setNotebookTab("hypotheses"); setNotesOpen(true); focusWindow("notes"); }
    else if (!hasNetworkEvidence) openApp("network");
    else openApp("terminal");
  }

  function selectMessage(id: string) {
    setSelectedEmailId(id);
    setAnalysisOpen(false);
    setAnalysisFeedback(null);
    setSignals([]);
    openApp("mail");
  }

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
    setMaximizedApp(null);
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
    selectMessage(nextStoryClue ?? "mail-004");
    setProgress((current) => ({ ...current, currentStep: "mail" }));
  }

  function toggleSignal(signal: PhishingSignal) {
    setAnalysisFeedback(null);
    setSignals((current) =>
      current.includes(signal)
        ? current.filter((item) => item !== signal)
        : [...current, signal],
    );
  }

  function validateAnalysis() {
    const feedback = (kind: "error" | "success" | "info", message: string, details?: string[]) => {
      setAnalysisFeedback((current) => ({ kind, message, details, attempt: (current?.attempt ?? 0) + 1 }));
      window.requestAnimationFrame(() => analysisFeedbackRef.current?.scrollIntoView({ block: "nearest" }));
    };
    if (selectedEmail.id !== phishingEmailId) {
      if (!signals.length) {
        feedback("info", `Aucun signal suspect relevé dans « ${selectedEmail.subject} ». Vous pouvez poursuivre : tous les messages ne contiennent pas une preuve.`);
        return;
      }
      const explanations: Record<PhishingSignal, string> = {
        sender: selectedEmail.from.endsWith("@helix.example")
          ? `Expéditeur externe : non. L’adresse ${selectedEmail.from} utilise le domaine interne helix.example.`
          : "Ce message vient d’un contact personnel. Une origine externe ne suffit pas à établir une tentative de phishing.",
        domain: "Domaine ressemblant : aucun domaine d’imitation n’est présent dans ce message.",
        link: "Destination réelle différente : aucun lien n’est présent dans ce message, il n’y a donc pas de destination à comparer.",
        urgency: "Pression temporelle : le message n’impose ni délai court ni menace de suspension de compte.",
      };
      feedback("info", `Aucune preuve ajoutée pour « ${selectedEmail.subject} ». Les cases cochées ne correspondent pas aux éléments de cet email.`, signals.map((signal) => explanations[signal]));
      return;
    }

    const result = analyzePhishingSignals(signals);

    if (!result.isEnough) {
      feedback("error", signals.length === 0 ? "Sélectionnez au moins deux signaux suspects avant de valider l’analyse." : "Un seul signal est sélectionné. Relevez au moins un autre indice dans ce message.");
      return;
    }

    addEvidence(result.evidenceIds);
    const newCount = result.evidenceIds.filter((id) => !discovered.has(id)).length;
    if (result.evidenceIds.length < 2) {
      feedback("info", `${newCount ? "Une preuve ajoutée au carnet." : "Cette preuve est déjà dans le carnet."} Ces signaux pointent vers le même domaine suspect. Cherchez aussi comment le message essaie de vous faire agir.`);
      return;
    }
    feedback("success", newCount ? `${newCount} nouvelle${newCount > 1 ? "s" : ""} preuve${newCount > 1 ? "s" : ""} ajoutée${newCount > 1 ? "s" : ""} au carnet. Vous pouvez y valider l’hypothèse de phishing ciblé.` : "Ces preuves sont déjà dans le carnet. Vous pouvez y consulter ou valider l’hypothèse de phishing ciblé.");
    setNotebookTab("evidence");
    setNotesOpen(true);
    focusWindow("notes");
    setAnnouncement("Analyse terminée. Consultez le carnet pour valider l’hypothèse.");
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
          <img src="/judy-alvarez.png" alt="Portrait de Judy Alvarez" />
        </div>

        <div className="case-home__content">
          <h2 id="case-title">Judy Alvarez</h2>

          {caseComplete ? (
            <>
              <p>
                Judy préparait quelque chose : elle me demandait de couvrir son départ
                et conservait une référence de l’archive ORION. Puis une autre machine
                a repris sa session, avant l’envoi du message qui accuse Nora.
              </p>
              <div className="case-result">
                <span>6 preuves vérifiées</span>
                <strong>Quelqu’un a continué sous son nom.</strong>
              </div>
              <p>Si Nora dit vrai, Judy était déjà partie. Le dernier message ne suffit plus à l’accuser : son compte était utilisé ailleurs. L’archive a aussi changé, mais son empreinte ne dit ni qui l’a modifiée ni pourquoi.</p>
              <p>Judy, pourquoi me demander de mentir avant même que tout commence ?</p>
              <p className="investigation-next">Fin du chapitre 01 · Max sait désormais que les dernières traces de Judy ne racontent pas toutes sa soirée. Sa destination reste inconnue.</p>
              <button className="soft-button" type="button" onClick={() => openApp("timeline")}>
                Voir la chronologie
              </button>
            </>
          ) : (
            <>
              <p>
                Tu t’appelles Max. Il y a 36 heures, Judy devait te retrouver au café.
                Elle n’est jamais venue. Tu retrouves son ordinateur encore allumé.
                Un brouillon porte ton nom.
              </p>
              <div className="case-home__meta">
                <span>12 octobre · le rendez-vous manqué</span>
                <span>« Max, si on te demande… »</span>
              </div>
              {!restartPending ? <div className="case-primary-action">
                <button className="soft-button" type="button" onClick={progress.discoveredEvidenceIds.length || progress.storyClueIds?.length ? followLead : startInvestigation}>
                  {progress.discoveredEvidenceIds.length || progress.storyClueIds?.length ? "Poursuivre l’enquête" : "Ouvrir Messages"}
                </button>
              </div> : null}
            </>
          )}
          <div className="restart-case">
            {restartPending ? <div className="restart-confirmation" role="group" aria-label="Recommencer le dossier">
              <p>Effacer les preuves et recommencer ce dossier ?</p>
              <div className="story-actions">
              <button className="soft-button" type="button" onClick={() => {
                setProgress(initialProgress); setSignals([]); setAnalysisOpen(false);
                setTerminalLines([]); setSelectedFile(null); setRestartPending(false);
                resetDesktopLayout(); setAnnouncement("Nouvelle enquête commencée.");
              }}>Confirmer le redémarrage</button>
              <button className="soft-button" type="button" onClick={() => setRestartPending(false)}>Annuler</button>
              </div>
            </div> : <details className="case-options"><summary>Options du dossier</summary><div className="story-actions">
              <button className="soft-button" type="button" onClick={() => window.dispatchEvent(new Event("trace:prologue"))}>Relire le prologue</button>
              <button className="soft-button" type="button" onClick={() => setRestartPending(true)}>Recommencer le dossier</button>
            </div></details>}
          </div>
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
                  setAnalysisFeedback(null);
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
            {selectedEmail.draft ? <span className="status-pill">BROUILLON / NON ENVOYÉ</span> : null}
          </header>

          <dl className="mail-space__meta">
            <div><dt>De</dt><dd>{selectedEmail.from}</dd></div>
            <div><dt>À</dt><dd>{selectedEmail.to}</dd></div>
          </dl>

          <div className="mail-space__body">
            {selectedEmail.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

            {selectedEmail.displayLink ? (
              <div className="link-inspector">
                <div><span>affiché</span><strong>{selectedEmail.displayLink}</strong></div>
                <div><span>réel</span><code>{selectedEmail.actualLink}</code></div>
              </div>
            ) : null}
          </div>

          {selectedStoryClue ? <section className="file-preview" aria-label="Réflexion de Max">
            <p>{selectedStoryClue.detail}</p>
            <div className="story-actions">
            <button className="soft-button" type="button" onClick={() => {
              setProgress((current) => ({ ...current, storyClueIds: [...new Set([...(current.storyClueIds ?? []), selectedEmail.id])] }));
              selectMessage(selectedStoryClue.next);
            }}>{selectedStoryClue.action}</button>
            </div>
            <small>En suivant la piste suivante, ce passage est aussi conservé dans ton carnet.</small>
          </section> : null}

          {!selectedStoryClue && !analysisOpen ? <div className="mail-space__toolbar">
            <button
              className="soft-button"
              type="button"
              onClick={() => setAnalysisOpen((open) => !open)}
              aria-expanded={analysisOpen}
              aria-controls="analysis-panel"
            >
              Analyser ce message
            </button>
          </div> : null}

          {analysisOpen && !selectedStoryClue ? (
            <section className="analysis-sheet" id="analysis-panel" aria-labelledby="analysis-title">
              <header>
                <div>
                  <h3 id="analysis-title">Quels signaux sont suspects ?</h3>
                </div>
                <span>{signals.length} sélectionné{signals.length > 1 ? "s" : ""}</span>
              </header>

              <p className="analysis-hint">Message analysé : <strong>{selectedEmail.subject}</strong></p>

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

              <p className="analysis-hint">Tous les messages ne sont pas suspects. Ne cochez que les indices présents. Deux signaux concordants permettent d’étayer une analyse de phishing ; un mail ordinaire ne bloque pas l’enquête.</p>

              <button className="soft-button" type="button" onClick={validateAnalysis}>
                Valider l’analyse
              </button>
              {analysisFeedback ? <div ref={analysisFeedbackRef} key={analysisFeedback.attempt} className="analysis-feedback" data-kind={analysisFeedback.kind} role={analysisFeedback.kind === "error" ? "alert" : "status"} aria-atomic="true"><strong>{analysisFeedback.kind === "error" ? "Analyse incomplète" : analysisFeedback.kind === "success" ? "Analyse confirmée" : "Résultat de l’analyse"}</strong><span>{analysisFeedback.message}</span>{analysisFeedback.details ? <ul>{analysisFeedback.details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}</div> : null}
              {analysisFeedback && selectedEmail.id !== phishingEmailId ? <div className="file-preview">
                <p>Ce message n’est pas une étape à valider. Une autre piste : l’alerte de sécurité reçue à 21 h 52 demande à Judy d’agir en urgence.</p>
                <button className="soft-button" type="button" onClick={() => selectMessage(phishingEmailId)}>Examiner l’alerte de sécurité</button>
              </div> : null}
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
        <p className="investigation-next">Max / Le message de 22 h 47 accuse Nora. Est-ce vraiment Judy qui l’a envoyé ? Ces connexions peuvent montrer qui avait accès à son compte.</p>
        <header className="app-heading">
          <div>
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
        {hasNetworkEvidence ? <div className="file-preview"><p>À 22 h 44, une autre machine utilise le compte de Judy. Trois minutes plus tard, un message accuse Nora. Le nom de Judy dans l’expéditeur ne garantit plus que ces mots sont les siens.</p><button className="soft-button" type="button" onClick={() => openApp("files")}>Chercher ce que Judy voulait protéger</button></div> : null}
      </section>
    );
  }

  function renderTerminal() {
    if (!hasNetworkEvidence) {
      return (
        <section className="empty-app">
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
          Judy a laissé une empreinte de son archive. Comparez-la avec <code>sha256sum orion-export.zip</code>. Toutes les commandes : <code>help</code>.
        </p>
        {hasHashEvidence ? <div className="file-preview"><p>Ce fichier n’est plus celui dont Judy avait gardé l’empreinte. Son dernier message assure pourtant que tout est normal. Quelqu’un essaie-t-il d’effacer ce qu’elle avait trouvé ?</p><button className="soft-button" type="button" onClick={() => openApp("case")}>Faire le point sur la soirée</button></div> : null}
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
                else setSelectedFile(row.name);
              }}
            >
              <span className="file-row__icon" aria-hidden="true">□</span>
              <strong>{row.name}</strong>
              <small>{row.meta}</small>
              {row.suspect ? <em>{hasArchiveEvidence ? "identifiée" : "à vérifier"}</em> : null}
            </button>
          ))}
        </div>

        {selectedFile ? <article className="file-preview" aria-live="polite">
          <h3>{selectedFile}</h3>
          <pre>{selectedFile === "auth.log"
            ? sessionEvents.map((event) => `${event.time} ${event.device} ${event.sessionId} ${event.event}`).join("\n")
            : runTerminalCommand(`cat ${selectedFile}`).output.join("\n")}</pre>
        </article> : null}

        <p className="files-hint">
          L’archive ORION mérite une vérification d’intégrité dans le Terminal.
        </p>
      </section>
    );
  }

  function renderTimeline() {
    const items = [
      { time: "20:26", title: "Le brouillon pour Max", detail: "Judy demande à Max de confirmer un départ à 20 h 30. Le message n’a pas été envoyé.", active: progress.storyClueIds?.includes("draft-max") },
      { time: "20:31", title: "La lumière est encore allumée", detail: "Nora parle de deux versions d’ORION. La présence de Judy reste incertaine.", active: progress.storyClueIds?.includes("mail-003") },
      { time: "21:52", title: "Message externe reçu", detail: "Une fausse alerte de sécurité tente de récupérer l’accès ORION.", active: hasPhishingEvidence },
      { time: "22:12", title: "Le départ rapporté par Nora", detail: "Dans son mail de 22 h 24, Nora dit avoir vu Judy sortir avec son sac.", active: progress.storyClueIds?.includes("mail-departure") },
      { time: "22:44", title: "Session S-4831 réutilisée", detail: "UNKNOWN-WIN reprend le jeton.", active: hasNetworkEvidence },
      { time: "22:45", title: "Export ORION téléchargé", detail: "orion-export.zip apparaît sur le poste.", active: hasArchiveEvidence },
      { time: "22:47", title: "Un message accuse Nora", detail: "Le compte de Judy affirme qu’elle est encore au bureau. L’identité de la personne qui écrit n’est pas établie.", active: progress.storyClueIds?.includes("mail-sent") },
      { time: "Maintenant", title: "Empreinte divergente", detail: "Max constate que l’archive diffère de la référence. L’heure de sa modification est inconnue.", active: hasHashEvidence },
    ];

    return (
      <section className="timeline-space" aria-labelledby="timeline-title">
        <header className="app-heading">
          <div>
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
        data-maximized={maximizedApp === app}
        data-foreground={activeApp === app}
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
            >×</button>
            <button
              type="button"
              aria-label={`Réduire ${meta.label}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => minimizeApp(app)}
            >−</button>
            <button type="button" aria-label={`${maximizedApp === app ? "Restaurer" : "Agrandir"} ${meta.label}`}
              aria-pressed={maximizedApp === app}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setMaximizedApp((current) => current === app ? null : app)}>□</button>
          </div>
          <div className="app-window__identity">
            <span>{meta.glyph}</span>
            <strong>{meta.label}</strong>
          </div>
          <span className="app-window__code">~/judy/{app}</span>
        </header>
        <div className="app-window__body">
          {renderApp(app)}
        </div>
      </div>
    );
  }

  return (
    <main className="judy-os" id="main-content" tabIndex={-1} aria-label={`Bureau forensic, dossier ${caseId}`}>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      {announcement && /preuves|Phishing ciblé confirmé|Empreinte divergente/.test(announcement) ? <div key={announcement} className="evidence-notice" aria-hidden="true">{announcement}</div> : null}
      {saveFailed ? <p className="save-warning" role="status">Sauvegarde locale indisponible. Gardez cet onglet ouvert pour conserver votre progression.</p> : null}

      <img className="judy-os__wallpaper" src={judyWallpaper} alt="" aria-hidden="true" />
      <div className="judy-os__veil" aria-hidden="true" />

      <header className="os-menubar">
        <div className="os-menubar__left">
          <img className="trace-logo" src="/trace-mark.svg" alt="" />
          <strong className="system-brand">TRACE // ZERO</strong>
        </div>
        <div className="os-menubar__center">
          <time>{clock}</time>
        </div>
        <div className="os-menubar__right">
          <PlayerGuide />
          <button className="layout-reset" type="button" onClick={resetDesktopLayout}>
            Ranger
          </button>
          <button
            type="button"
            className="notes-toggle"
            aria-pressed={notesOpen}
            onClick={() => {
              setNotesOpen((open) => !open);
              if (!notesOpen) { setNotebookTab("leads"); focusWindow("notes"); }
            }}
          >
            Carnet {progress.discoveredEvidenceIds.length}/6
          </button>
          <SystemStatus />
          <AudioControl />
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
                  <strong id="notebook-title">Carnet de Max</strong>
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
                <button aria-selected={notebookTab === "leads"} onClick={() => setNotebookTab("leads")} role="tab" type="button">Pistes</button>
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

              {notebookTab === "leads" ? (
                <div className="notes-list" role="tabpanel" aria-label="Pistes">
                  <section className="investigation-lead" aria-label="Piste en cours">
                    <strong>{lead.question}</strong>
                    <div className="story-actions">
                      <button className="soft-button soft-button--small" type="button" onClick={followLead}>{lead.action}</button>
                      <details><summary>Besoin d’un indice ?</summary><p>{lead.hint}</p></details>
                    </div>
                  </section>
                </div>
              ) : notebookTab === "evidence" ? (
                <div className="notes-list" role="tabpanel">
                  {(progress.storyClueIds ?? []).map((id) => {
                    const clue = storyClues[id as StoryClueId];
                    return clue ? <article className="note-card" key={id}><strong>{clue.title}</strong><p>{id === "mail-sent" && notebook.sentMessage ? notebook.sentMessage : clue.detail}</p><button className="soft-button soft-button--small" type="button" onClick={() => { setNotesOpen(false); selectMessage(id); }}>Relire le message</button></article> : null;
                  })}
                  {progress.discoveredEvidenceIds.length === 0 && !progress.storyClueIds?.length ? (
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
                          <button className="soft-button soft-button--small" type="button" onClick={() => {
                            setNotesOpen(false);
                            if (id === "E01" || id === "E02") selectMessage(phishingEmailId);
                            else if (id === "E03" || id === "E04") openApp("network");
                            else if (id === "E05") openApp("files");
                            else { setTerminalInput("sha256sum orion-export.zip"); openApp("terminal"); }
                          }}>{id === "E06" ? "Vérifier à nouveau" : "Revoir la source"}</button>
                        </article>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="notes-list" role="tabpanel">
                  <article className="note-card note-card--hypothesis">
                    <strong>Phishing ciblé</strong>
                    <p>{notebook.hypothesis}</p>
                    {notebook.missing.length ? <p>À vérifier : {notebook.missing.join(" et ").toLowerCase()}.</p> : null}
                    <button
                      className="soft-button soft-button--small"
                      disabled={!hasPhishingEvidence || hypothesisValidated}
                      onClick={validateHypothesis}
                      type="button"
                    >
                      {hypothesisValidated ? "Hypothèse validée" : "Valider la conclusion"}
                    </button>
                  </article>
                  {notebook.conclusions.length ? <article className="note-card"><strong>Ce que je peux en déduire</strong>{notebook.conclusions.map((conclusion) => <p key={conclusion}>{conclusion}</p>)}</article> : null}
                </div>
              )}
            </aside>
          ) : null}
        </div>
      </section>

      <nav className="os-dock" aria-label="Applications de Judy">
        <Link className="dock-home" href="/" aria-label="Accueil Trace Zero"><img className="trace-logo" src="/trace-mark.svg" alt="" /></Link>
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
