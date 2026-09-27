import { describe, expect, it } from "vitest";
import { INCIDENTS, applyFix, createGame, isGameOver, submitDiagnosis, tick, useTool } from "./game";

describe("TRACE//NULL V2 simulation", () => {
  it("ships ten incidents for replayable runs", () => {
    expect(INCIDENTS).toHaveLength(10);
  });
  it("starts a fresh incident at full stability", () => {
    const state = createGame();
    expect(state.stability).toBe(100);
    expect(state.time).toBe(90);
    expect(state.resolved).toBe(false);
  });

  it("reveals evidence through investigation tools", () => {
    const state = useTool(createGame(INCIDENTS[1]), "LOGS");
    expect(state.usedTools).toContain("LOGS");
    expect(state.feedback).toContain("waiting for lock");
  });

  it("rewards a correct root-cause diagnosis", () => {
    const state = submitDiagnosis(createGame(INCIDENTS[0]), "Queue retry loop");
    expect(state.score).toBe(100);
    expect(state.feedback).toContain("CONFIRMED");
  });

  it("resolves an incident with the correct root-cause repair", () => {
    const state = createGame(INCIDENTS[0]);
    const investigated = useTool(useTool(state, "TRACE"), "LOGS");
    const resolved = applyFix(investigated, INCIDENTS[0].correctFix);
    expect(resolved.resolved).toBe(true);
    expect(resolved.score).toBeGreaterThan(100);
  });

  it("penalizes a symptom-level repair", () => {
    const state = applyFix(createGame(INCIDENTS[0]), "Restart the API Gateway");
    expect(state.resolved).toBe(false);
    expect(state.stability).toBe(85);
    expect(state.score).toBe(0);
  });

  it("ends when the system runs out of time", () => {
    const state = tick(createGame(), 90);
    expect(state.time).toBe(0);
    expect(isGameOver(state)).toBe(true);
  });
});
