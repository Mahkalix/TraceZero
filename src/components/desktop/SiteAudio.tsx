"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { createSiteMusic } from "../../features/presentation/intro-music";

const AudioSettings = createContext({ volume: 40, muted: false, toggle: () => {}, changeVolume: (_value: number) => { void _value; } });

export function SiteAudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState({ volume: 40, muted: false });
  const player = useRef<ReturnType<typeof createSiteMusic> | null>(null);
  const settingsRef = useRef(settings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let saved = { volume: 40, muted: false };
    try {
      const value = JSON.parse(localStorage.getItem("trace-zero:audio") ?? "null");
      if (value && typeof value.volume === "number" && Number.isFinite(value.volume) && typeof value.muted === "boolean") saved = { volume: Math.max(0, Math.min(100, value.volume)), muted: value.muted };
    } catch { /* Default sound settings remain usable. */ }
    settingsRef.current = saved; setSettings(saved); setLoaded(true);
    try {
      const engine = createSiteMusic();
      player.current = engine;
      engine.setVolume(saved.muted ? 0 : saved.volume / 100);
      if (!saved.muted) void engine.resume().catch(() => {});
    } catch { /* Browser may not support Web Audio. */ }
    const unlock = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-audio-control]')) return;
      if (!settingsRef.current.muted) void player.current?.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      player.current?.stop(); player.current = null;
    };
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
    player.current?.setVolume(settings.muted ? 0 : settings.volume / 100);
    if (loaded) { try { localStorage.setItem("trace-zero:audio", JSON.stringify(settings)); } catch { /* Optional persistence. */ } }
  }, [settings, loaded]);

  const toggle = () => {
    if (settings.muted || settings.volume === 0) void player.current?.resume().catch(() => {});
    setSettings((current) => current.muted || current.volume === 0 ? { volume: current.volume || 40, muted: false } : { ...current, muted: true });
  };
  const changeVolume = (volume: number) => {
    void player.current?.resume().catch(() => {});
    setSettings({ volume, muted: volume === 0 });
  };
  return <AudioSettings.Provider value={{ ...settings, toggle, changeVolume }}>{children}</AudioSettings.Provider>;
}

function Speaker({ muted }: { muted: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>{muted ? <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.6"/> : <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>}</svg>;
}

export function AudioControl({ intro = false }: { intro?: boolean }) {
  const { volume, muted, toggle, changeVolume } = useContext(AudioSettings);
  const off = muted || volume === 0;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("pointerdown", outside);
    return () => window.removeEventListener("pointerdown", outside);
  }, [open]);
  if (intro) return <button data-audio-control className="intro-audio" type="button" onClick={toggle} aria-label={off ? "Activer le son" : "Couper le son"} aria-pressed={!off}><Speaker muted={off}/><span>{off ? "Son coupé" : "Son activé"}</span></button>;
  return <div className="desktop-audio" data-audio-control ref={root} onKeyDown={(event) => { if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className="volume-trigger" type="button" aria-label="Volume de la musique" title={off ? "Son coupé" : `Volume : ${volume} %`} aria-expanded={open} aria-controls="music-volume-panel" onClick={() => setOpen((value) => !value)}><Speaker muted={off}/></button>
    {open ? <section id="music-volume-panel" className="volume-panel" aria-label="Réglages du son">
      <div className="volume-row">
        <button type="button" className="volume-trigger" aria-label={off ? "Activer le son" : "Couper le son"} aria-pressed={!off} onClick={toggle}><Speaker muted={off}/></button>
        <input type="range" min="0" max="100" step="1" aria-label="Volume" aria-valuetext={`${volume} %${muted ? ', son coupé' : ''}`} value={volume} onChange={(event) => changeVolume(Number(event.target.value))} style={{ '--volume': `${volume}%` } as CSSProperties}/>
        <output>{muted ? 0 : volume}%</output>
      </div>
    </section> : null}
  </div>;
}
