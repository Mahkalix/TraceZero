export function SystemStatus() {
  return <div className="system-indicators">
    <span className="system-wifi" role="img" aria-label="Wi-Fi connecté">
      <svg viewBox="0 0 24 20" fill="none" aria-hidden="true"><path d="M2 6a16 16 0 0 1 20 0M5.5 10a10.5 10.5 0 0 1 13 0M9 14a5 5 0 0 1 6 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><circle cx="12" cy="17.5" r="1.6" fill="currentColor"/></svg>
    </span>
    <span className="system-battery" role="img" aria-label="Batterie 100 %">
      <span aria-hidden="true">100%</span>
      <svg viewBox="0 0 30 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="24" height="14" rx="3.8" stroke="currentColor" strokeWidth="1.3" opacity=".65"/><rect x="3.5" y="3.5" width="19" height="9" rx="1.6" fill="currentColor"/><path d="M27 5v6a3 3 0 0 0 0-6Z" fill="currentColor" opacity=".65"/></svg>
    </span>
  </div>;
}
