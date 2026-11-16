import { describe, it, expect } from "vitest";
import { historyReducer, initHistory } from "../model/reducer";
import { NodeEl, Flow } from "../model/types";

const node = (id: string): NodeEl => ({ id, kind: "process", label: id, x: 0, y: 0 });
const flow = (id: string, s: string, t: string): Flow => ({ id, source: s, target: t, label: id });

describe("model reducer + history", () => {
  it("adds, moves, and deletes nodes", () => {
    let h = initHistory();
    h = historyReducer(h, { type: "ADD_NODE", node: node("a") });
    h = historyReducer(h, { type: "MOVE_NODE", id: "a", x: 42, y: 7 });
    expect(h.present.nodes.a).toMatchObject({ x: 42, y: 7 });
    h = historyReducer(h, { type: "DELETE_NODE", id: "a" });
    expect(h.present.nodes.a).toBeUndefined();
  });

  it("deleting a node cascades to its flows", () => {
    let h = initHistory();
    h = historyReducer(h, { type: "ADD_NODE", node: node("a") });
    h = historyReducer(h, { type: "ADD_NODE", node: node("b") });
    h = historyReducer(h, { type: "ADD_FLOW", flow: flow("f", "a", "b") });
    h = historyReducer(h, { type: "DELETE_NODE", id: "a" });
    expect(h.present.flows.f).toBeUndefined();
  });

  it("undo restores the prior state, redo re-applies", () => {
    let h = initHistory();
    h = historyReducer(h, { type: "ADD_NODE", node: node("a") });
    h = historyReducer(h, { type: "MOVE_NODE", id: "a", x: 99, y: 0 });
    h = historyReducer(h, { type: "UNDO" });
    expect(h.present.nodes.a.x).toBe(0); // move undone
    h = historyReducer(h, { type: "REDO" });
    expect(h.present.nodes.a.x).toBe(99); // move redone
  });

  it("a no-op action does not create a history entry", () => {
    let h = initHistory();
    h = historyReducer(h, { type: "ADD_NODE", node: node("a") });
    const past = h.past.length;
    h = historyReducer(h, { type: "MOVE_NODE", id: "ghost", x: 1, y: 1 }); // no such node
    expect(h.past.length).toBe(past);
  });
});
