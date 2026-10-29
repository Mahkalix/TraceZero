import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { StationBoot } from "../../components/desktop/StationBoot";

it("le rendu serveur masque le bureau jusqu’au contrôle de session, sans annoncer un faux démarrage", () => {
  const html = renderToString(createElement(StationBoot, null, createElement("main", null, "Dossier 001")));
  expect(html).toContain('data-boot-phase="checking"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain("Dossier 001");
  expect(html).not.toContain('role="dialog"');
});
