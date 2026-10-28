"use client";

import { useRef } from "react";

export function PlayerGuide() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <>
    <button className="guide-toggle" type="button" aria-label="Comment jouer" onClick={() => dialogRef.current?.showModal()}>
      <span className="guide-toggle__label">Comment jouer</span><span className="guide-toggle__icon" aria-hidden="true">?</span>
    </button>
    <dialog ref={dialogRef} className="player-guide" aria-labelledby="player-guide-title" onClick={(event) => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialogRef.current?.close();
      }
    }}>
      <div className="player-guide__chrome"><span>Guide de l’enquête</span><button type="button" aria-label="Fermer les explications" onClick={() => dialogRef.current?.close()}>×</button></div>
      <div className="player-guide__body">
        <h2 id="player-guide-title">Comment jouer</h2>
        <p>Judy a disparu. Explorez une copie de son ordinateur pour comprendre ce qui s’est passé.</p>
        <ol>
          <li><strong>Explorez les applications.</strong><p>Le lanceur ouvre les messages, le réseau, le terminal et les fichiers. Les fenêtres peuvent être déplacées, réduites ou agrandies.</p></li>
          <li><strong>Collectez les preuves.</strong><p>Analysez les messages suspects et recoupez les traces. Vos découvertes apparaissent dans le carnet.</p></li>
          <li><strong>Vérifiez votre hypothèse.</strong><p>Validez votre conclusion dans le carnet, puis poursuivez l’enquête jusqu’aux six preuves.</p></li>
        </ol>
        <p className="player-guide__note">Les commandes sont expliquées dans le terminal. La progression est enregistrée sur cet appareil. Aucune action ne touche un système réel.</p>
      </div>
    </dialog>
  </>;
}
