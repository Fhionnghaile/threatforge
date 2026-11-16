/**
 * CRDT binding: project the Model onto a Yjs document so concurrent edits from
 * multiple clients converge. Nodes and flows live in Y.Maps keyed by id; last
 * writer wins per field, but adds/removes on different ids never conflict.
 */
import * as Y from "yjs";
import { Model, NodeEl, Flow, emptyModel } from "../model/types";

export function createDoc(): Y.Doc {
  return new Y.Doc();
}

export function writeModel(doc: Y.Doc, model: Model): void {
  const nodes = doc.getMap<NodeEl>("nodes");
  const flows = doc.getMap<Flow>("flows");
  doc.transact(() => {
    for (const [id, n] of Object.entries(model.nodes)) nodes.set(id, n);
    for (const [id, f] of Object.entries(model.flows)) flows.set(id, f);
  });
}

export function upsertNode(doc: Y.Doc, node: NodeEl): void {
  doc.getMap<NodeEl>("nodes").set(node.id, node);
}

export function deleteNode(doc: Y.Doc, id: string): void {
  doc.transact(() => {
    doc.getMap<NodeEl>("nodes").delete(id);
    const flows = doc.getMap<Flow>("flows");
    for (const [fid, f] of flows.entries()) {
      if (f.source === id || f.target === id) flows.delete(fid);
    }
  });
}

export function upsertFlow(doc: Y.Doc, flow: Flow): void {
  doc.getMap<Flow>("flows").set(flow.id, flow);
}

export function readModel(doc: Y.Doc): Model {
  const model = emptyModel();
  for (const [id, n] of doc.getMap<NodeEl>("nodes").entries()) model.nodes[id] = n;
  for (const [id, f] of doc.getMap<Flow>("flows").entries()) model.flows[id] = f;
  return model;
}

/** Exchange state between two docs until both converge (for tests / offline sync). */
export function sync(a: Y.Doc, b: Y.Doc): void {
  const ua = Y.encodeStateAsUpdate(a);
  const ub = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, ub);
  Y.applyUpdate(b, ua);
}
