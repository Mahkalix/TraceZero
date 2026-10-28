export const bootSessionKey = "trace-zero:station-boot:v1";
export type BootStorage = Pick<Storage, "getItem" | "setItem">;

export function hasBootPlayed(storage: BootStorage): boolean {
  try { return storage.getItem(bootSessionKey) === "played"; }
  catch { return false; }
}

export function markBootPlayed(storage: BootStorage): void {
  try { storage.setItem(bootSessionKey, "played"); }
  catch { /* The station remains usable when session storage is unavailable. */ }
}

export function finishBoot(storage: BootStorage, skipped: boolean) {
  markBootPlayed(storage);
  return skipped ? "skipped" as const : "completed" as const;
}
