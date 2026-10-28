"use client";

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { finishBoot, hasBootPlayed, markBootPlayed } from "../../features/presentation/boot-session";
import { AudioControl, SiteAudioProvider } from "./SiteAudio";

const prologueKey = "trace-zero:prologue:v1";
const prologue = [
  { title: "Tu t’appelles Max.", lines: ["Judy devait te retrouver au café, à votre table habituelle.", "Elle n’est jamais venue. Depuis trente-six heures, plus personne n’a de nouvelles."] },
  { title: "Son ordinateur est encore allumé.", lines: ["Ses messages, ses notes, les traces de sa dernière soirée : tout est encore là.", "Dans ses brouillons, quelques mots te sont adressés."] },
  { title: "« Max, si on te demande, je suis partie à 20 h 30. »", lines: ["Ce message n’a jamais été envoyé.", "Pourquoi Judy voulait-elle que tu la couvres ? Et que s’est-il passé après ?"] },
  { title: "Reconstitue sa dernière soirée.", lines: ["Commence par ce brouillon, puis recoupe les échanges avec Nora. Garde les passages importants dans ton carnet.", "Les fichiers et les connexions t’aideront à vérifier leurs versions. Si tu ne sais plus où chercher, ouvre Carnet → Pistes.", "Tu cherches ce qui est arrivé à Judy. Chaque message n’est pas une énigme à valider."] },
];

export function StationBoot({ children }: { children?: ReactNode }) {
  const [phase, setPhase] = useState<"checking" | "playing" | "story" | "ready">("checking");
  const [storyPage, setStoryPage] = useState(0);
  const storyRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const bootRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const startedRef = useRef(false);
  const complete = useCallback((skipped = false) => {
    if (completedRef.current) return;
    completedRef.current = true;
    try { finishBoot(window.sessionStorage, skipped); } catch { /* Storage can be blocked. */ }
    try { window.sessionStorage.setItem(prologueKey, "read"); } catch { /* Optional persistence. */ }
    setPhase("ready");
    setAnnouncement("Dossier prêt");
    window.requestAnimationFrame(() => {
      desktopRef.current?.querySelector<HTMLElement>("#main-content")?.focus();
    });
  }, []);

  const beginStory = useCallback(() => {
    let read = false;
    try { read = window.sessionStorage.getItem(prologueKey) === "read"; } catch { /* Show context. */ }
    if (read) complete(); else setPhase("story");
  }, [complete]);

  useEffect(() => {
    let played = false;
    try { played = hasBootPlayed(window.sessionStorage); } catch { /* Continue without persistence. */ }
    if (played && !startedRef.current) {
      let read = false;
      try { read = window.sessionStorage.getItem(prologueKey) === "read"; } catch { /* Show context if unavailable. */ }
      setPhase(read ? "ready" : "story"); return;
    }
    startedRef.current = true;
    try { markBootPlayed(window.sessionStorage); } catch { /* Continue without storage. */ }
    completedRef.current = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    setPhase("playing");
    setAnnouncement("Chargement du dossier 001");
    const styles = window.getComputedStyle(desktopRef.current!);
    const duration = Number.parseFloat(styles.getPropertyValue(media.matches ? "--boot-reduced-ms" : "--boot-duration-ms"));
    const timer = window.setTimeout(beginStory, duration);
    const onMotionChange = () => { if (media.matches) { setReduced(true); beginStory(); } };
    media.addEventListener("change", onMotionChange);
    return () => { window.clearTimeout(timer); media.removeEventListener("change", onMotionChange); };
  }, [beginStory]);

  useEffect(() => {
    const replay = () => { completedRef.current = false; setStoryPage(0); setPhase("story"); };
    window.addEventListener("trace:prologue", replay);
    return () => window.removeEventListener("trace:prologue", replay);
  }, []);

  useEffect(() => { if (phase === "story") storyRef.current?.focus(); }, [phase, storyPage]);
  useEffect(() => { if (phase === "ready") desktopRef.current?.querySelector<HTMLElement>("#main-content")?.focus(); }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    bootRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement && event.key !== "Escape" && event.key !== "Tab") return;
      if (["Enter", "Escape", " "].includes(event.key)) {
        event.preventDefault();
        if (event.key === "Escape") complete(true); else beginStory();
      }
      if (event.key === "Tab") { event.preventDefault(); bootRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    const onPointer = (event: PointerEvent) => { if (!(event.target instanceof Element && event.target.closest(".intro-audio"))) beginStory(); };
    window.addEventListener("pointerdown", onPointer, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, [beginStory, complete, phase]);

  return <SiteAudioProvider>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    {phase === "playing" ? <section ref={bootRef} tabIndex={-1} className="station-boot" data-reduced={reduced} role="dialog" aria-modal="true" aria-label="Démarrage de la station forensic">
      <AudioControl intro />
      <div className="boot-scene" aria-hidden="true">
        <div className="cinema-shutter cinema-shutter--top" />
        <div className="cinema-shutter cinema-shutter--bottom" />
        <div className="cinema-composition">
          <div className="cinema-emblem"><span /><span /></div>
          <div className="cinema-title">
            <div className="cinema-word cinema-word--trace">{"TRACE".split("").map((letter, index) => <span key={index}><b>{letter}</b></span>)}</div>
            <div className="cinema-word cinema-word--zero">{"ZERO".split("").map((letter, index) => <span key={index}><b>{letter}</b></span>)}</div>
          </div>
        </div>
      </div>
      {reduced ? <p className="boot-static">Trace//Zero · Dossier 001 prêt</p> : null}
      <p className="cinema-credit">GitHub · Maxence Badin-Léger aka @Mahkalix</p>
    </section> : null}
    {phase === "story" ? <section ref={storyRef} tabIndex={-1} className="station-boot narrative-prologue" role="dialog" aria-modal="true" aria-label="La dernière soirée — prologue" onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); complete(true); }
      if (event.key === "Tab") {
        const buttons = Array.from(storyRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === storyRef.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <div className="prologue-brand"><span aria-hidden="true" /><strong>TRACE // ZERO</strong></div>
      <AudioControl intro />
      <div className="prologue-card">
        <div className="prologue-copy" key={storyPage}>
        <h1>{prologue[storyPage].title}</h1>
        <div className="prologue-lines">{prologue[storyPage].lines.map((line, index) => <p key={line} style={{ animationDelay: `${.2 + index * .45}s` }}>{line}</p>)}</div>
        </div>
        <div className="prologue-footer">
        <div className="story-actions">
          <button className="soft-button" type="button" disabled={storyPage === 0} onClick={() => setStoryPage((page) => page - 1)}>Précédent</button>
          <button className="soft-button" type="button" onClick={() => storyPage < prologue.length - 1 ? setStoryPage((page) => page + 1) : complete()}>{storyPage < prologue.length - 1 ? "Continuer" : "Entrer dans le bureau"}</button>
        </div>
        </div>
      </div>
      <footer className="prologue-credit">GitHub · Maxence Badin-Léger aka @Mahkalix</footer>
    </section> : null}
    <div ref={desktopRef} className="station-content" data-boot-phase={phase} aria-hidden={phase !== "ready"} inert={phase !== "ready"}>
      {children}
    </div>
  </SiteAudioProvider>;
}
