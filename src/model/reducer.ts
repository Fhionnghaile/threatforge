/** Threat-model reducer with undo/redo history. Pure and serialisable. */
import { Model, NodeEl, Flow, emptyModel } from "./types";

export type Action =
  | { type: "ADD_NODE"; node: NodeEl }
  | { type: "MOVE_NODE"; id: string; x: number; y: number }
  | { type: "DELETE_NODE"; id: string }
  | { type: "ADD_FLOW"; flow: Flow }
  | { type: "DELETE_FLOW"; id: string }
  | { type: "SET_MODEL"; model: Model };

export function modelReducer(state: Model, action: Action): Model {
  switch (action.type) {
    case "ADD_NODE":
      return { ...state, nodes: { ...state.nodes, [action.node.id]: action.node } };
    case "MOVE_NODE": {
      const n = state.nodes[action.id];
      if (!n) return state;
      return { ...state, nodes: { ...state.nodes, [action.id]: { ...n, x: action.x, y: action.y } } };
    }
    case "DELETE_NODE": {
      const nodes = { ...state.nodes };
      delete nodes[action.id];
      // cascade: drop flows touching the node
      const flows = Object.fromEntries(
        Object.entries(state.flows).filter(
          ([, f]) => f.source !== action.id && f.target !== action.id
        )
      );
      return { nodes, flows };
    }
    case "ADD_FLOW":
      return { ...state, flows: { ...state.flows, [action.flow.id]: action.flow } };
    case "DELETE_FLOW": {
      const flows = { ...state.flows };
      delete flows[action.id];
      return { ...state, flows };
    }
    case "SET_MODEL":
      return action.model;
    default:
      return state;
  }
}

/** History wrapper state. */
export interface History {
  past: Model[];
  present: Model;
  future: Model[];
}

export const initHistory = (present: Model = emptyModel()): History => ({
  past: [],
  present,
  future: [],
});

export type HistoryAction = Action | { type: "UNDO" } | { type: "REDO" };

export function historyReducer(state: History, action: HistoryAction): History {
  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }
  if (action.type === "REDO") {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1),
    };
  }
  const next = modelReducer(state.present, action as Action);
  if (next === state.present) return state; // no-op, don't pollute history
  return { past: [...state.past, state.present], present: next, future: [] };
}
