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
          "check active sessions tomorrow",
          "something is wrong with the laptop token",
          "reference hash stored in reference.sha256",
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
