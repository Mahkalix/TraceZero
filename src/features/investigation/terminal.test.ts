import { describe, expect, it } from "vitest";
import { runTerminalCommand } from "./terminal";

describe("runTerminalCommand", () => {
  it("n'exécute que les commandes prévues", () => {
    const result = runTerminalCommand("whoami");

    expect(result.output[0]).toContain(
      "command not available in forensic sandbox",
    );
  });

  it("liste les artefacts sans toucher au système réel", () => {
    const result = runTerminalCommand("ls");

    expect(result.output).toContain("orion-export.zip");
    expect(result.evidenceIds).toContain("E05");
  });

  it("détecte la divergence SHA-256 de l'archive", () => {
    const result = runTerminalCommand("sha256sum orion-export.zip");

    expect(result.output).toContain("MISMATCH: reference hash differs");
    expect(result.evidenceIds).toEqual(["E05", "E06"]);
  });

  it("supporte clear sans sortie système", () => {
    const result = runTerminalCommand("clear");

    expect(result.clear).toBe(true);
    expect(result.output).toEqual([]);
  });
});
