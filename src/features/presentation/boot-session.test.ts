import { describe, expect, it } from "vitest";
import { bootSessionKey, finishBoot, hasBootPlayed } from "./boot-session";

describe("session de démarrage", () => {
  function storage() {
    const values = new Map<string, string>();
    return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  }
  it("une session neuve doit jouer l’intro", () => expect(hasBootPlayed(storage())).toBe(false));
  it("une intro terminée ne se rejoue pas", () => {
    const session = storage();
    expect(finishBoot(session, false)).toBe("completed");
    expect(hasBootPlayed(session)).toBe(true);
  });
  it("une intro passée est également mémorisée", () => {
    const session = storage();
    expect(finishBoot(session, true)).toBe("skipped");
    expect(session.getItem(bootSessionKey)).toBe("played");
  });
  it("un stockage bloqué ne fait pas planter la station", () => {
    const session = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(hasBootPlayed(session)).toBe(false);
    expect(() => finishBoot(session, true)).not.toThrow();
  });
});
