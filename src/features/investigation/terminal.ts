export type TerminalResult = {
  output: string[];
  evidenceIds?: string[];
  clear?: boolean;
};

const exportHash =
  "9f82d6d1e73e0b1b2d38f4b437a12ba8409b0f5da5c836c8e2abcc5cbf81e61d";
const referenceHash =
  "5a2e6917db132ab1bb1945961bd8a4d3c8d1f05598c61b321ad4d20d9f835bb4";

export function runTerminalCommand(raw: string): TerminalResult {
  const command = raw.trim();

  if (!command) return { output: [] };

  switch (command) {
    case "help":
      return {
        output: [
          "available: help, ls, cat, sha256sum, history, clear",
          "sandbox: commands are simulated and read-only",
        ],
      };
    case "ls":
      return {
        output: [
          "notes.txt",
          "reference.sha256",
          "orion-export.zip",
          "auth.log",
        ],
        evidenceIds: ["E05"],
      };
    case "cat notes.txt":
      return {
        output: [
          "12 octobre, 22 h 07 — Je devrais déjà être au café avec Max.",
          "Nora avait raison sur un point : les deux versions d’ORION ne racontent pas la même chose.",
          "Je voulais garder mon export pour comprendre avant d’accuser qui que ce soit.",
          "Quelque chose ne colle pas avec ma session. Vérifier les accès actifs.",
          "J’ai conservé l’empreinte de mon export dans reference.sha256.",
          "Comparer avec : sha256sum orion-export.zip. Si l’empreinte diffère, ce n’est plus mon fichier.",
          "Max, je te dois une explication. D’abord sortir d’ici.",
        ],
      };
    case "cat reference.sha256":
      return { output: [`${referenceHash}  orion-export.zip`] };
    case "sha256sum orion-export.zip":
      return {
        output: [`${exportHash}  orion-export.zip`, "MISMATCH: reference hash differs"],
        evidenceIds: ["E05", "E06"],
      };
    case "history":
      return {
        output: [
          "241  ls",
          "242  cat notes.txt",
          "243  sha256sum orion-export.zip",
        ],
      };
    case "clear":
      return { output: [], clear: true };
    default:
      return {
        output: [`trace: command not available in forensic sandbox: ${command}`],
      };
  }
}
