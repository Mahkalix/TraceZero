"use client";

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { finishBoot, hasBootPlayed, markBootPlayed } from "../../features/presentation/boot-session";

export function StationBoot({ children }: { children?: ReactNode }) {
  const [phase, setPhase] = useState<"checking" | "playing" | "ready">("checking");
  const [reduced, setReduced] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [run, setRun] = useState(0);
  const skipRef = useRef<HTMLButtonElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const startedRef = useRef(false);

  const complete = useCallback((skipped = false) => {
    if (completedRef.current) return;
    completedRef.current = true;
    try { finishBoot(window.sessionStorage, skipped); } catch { /* Storage can be blocked. */ }
    setPhase("ready");
    setAnnouncement("Dossier prêt");
    window.requestAnimationFrame(() => {
      desktopRef.current?.querySelector<HTMLElement>("#main-content")?.focus();
    });
  }, []);

  useEffect(() => {
    let played = false;
    try { played = hasBootPlayed(window.sessionStorage); } catch { /* Continue without persistence. */ }
    if (played && run === 0 && !startedRef.current) { setPhase("ready"); return; }
    startedRef.current = true;
    try { markBootPlayed(window.sessionStorage); } catch { /* Continue without storage. */ }
    completedRef.current = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    setPhase("playing");
    setAnnouncement("Chargement du dossier 001");
    const styles = window.getComputedStyle(desktopRef.current!);
    const duration = Number.parseFloat(styles.getPropertyValue(media.matches ? "--boot-reduced-ms" : "--boot-duration-ms"));
    const timer = window.setTimeout(() => complete(), duration);
    const onMotionChange = () => { if (media.matches) { setReduced(true); complete(); } };
    media.addEventListener("change", onMotionChange);
    return () => { window.clearTimeout(timer); media.removeEventListener("change", onMotionChange); };
  }, [complete, run]);

  useEffect(() => {
    if (phase !== "playing") return;
    skipRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (["Enter", "Escape", " "].includes(event.key)) {
        event.preventDefault(); complete(true);
      }
      if (event.key === "Tab") { event.preventDefault(); skipRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    const onPointer = () => complete(true);
    window.addEventListener("pointerdown", onPointer, { capture: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, [complete, phase]);

  return <>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    {phase === "playing" ? <section className="station-boot" data-reduced={reduced} role="dialog" aria-modal="true" aria-label="Démarrage de la station forensic">
      <button ref={skipRef} className="boot-skip" onClick={() => complete(true)} type="button">Passer <span aria-hidden="true">[ Échap ]</span></button>
      <div className="boot-scene" aria-hidden="true">
        <div className="boot-grid" />
        <div className="boot-console">
          <span className="boot-caption">TRACE OS / FORENSIC STATION</span>
          <div className="boot-lines"><p>BIOS / STATION LOCALE <span>OK</span></p><p>INTÉGRITÉ / COPIE EN LECTURE SEULE <span>OK</span></p><p>MONTAGE / DOSSIER 001 <span>OK</span></p></div>
          <div className="boot-brand"><span className="boot-symbol">{"//"}</span><strong>Trace<span>{"//"}</span>Zero</strong><small>LES RÉPONSES SONT DANS LES TRACES.</small></div>
          <div className="boot-panels"><span /><span /><span /></div>
        </div>
        <div className="boot-scan" />
      </div>
      {reduced ? <p className="boot-static">Trace//Zero · Dossier 001 prêt</p> : null}
    </section> : null}
    <div ref={desktopRef} className="station-content" data-boot-phase={phase} aria-hidden={phase === "checking"}>
      {children}
      <button className="boot-replay" type="button" onClick={() => { setRun((value) => value + 1); }}>Rejouer le démarrage</button>
    </div>
  </>;
}
