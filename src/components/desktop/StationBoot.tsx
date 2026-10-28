"use client";

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { finishBoot, hasBootPlayed, markBootPlayed } from "../../features/presentation/boot-session";

export function StationBoot({ children }: { children?: ReactNode }) {
  const [phase, setPhase] = useState<"checking" | "playing" | "ready">("checking");
  const [reduced, setReduced] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [run, setRun] = useState(0);
  const bootRef = useRef<HTMLElement>(null);
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
    bootRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (["Enter", "Escape", " "].includes(event.key)) {
        event.preventDefault(); complete(true);
      }
      if (event.key === "Tab") { event.preventDefault(); bootRef.current?.focus(); }
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
    {phase === "playing" ? <section ref={bootRef} tabIndex={-1} className="station-boot" data-reduced={reduced} role="dialog" aria-modal="true" aria-label="Démarrage de la station forensic">
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
    </section> : null}
    <div ref={desktopRef} className="station-content" data-boot-phase={phase} aria-hidden={phase === "checking"}>
      {children}
      <button className="boot-replay" type="button" onClick={() => { setRun((value) => value + 1); }}>Rejouer le démarrage</button>
    </div>
  </>;
}
