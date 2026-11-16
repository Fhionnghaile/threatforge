import { describe, it, expect } from "vitest";
import { createDoc, writeModel, upsertNode, upsertFlow, readModel, sync } from "../sync/crdt";
import { sampleModel } from "../model/sample";
import { NodeEl } from "../model/types";

const node = (id: string, x = 0): NodeEl => ({ id, kind: "process", label: id, x, y: 0 });

describe("CRDT sync", () => {
  it("two clients converge after concurrent, non-conflicting edits", () => {
    const a = createDoc();
    const b = createDoc();
    writeModel(a, sampleModel());
    sync(a, b); // b now mirrors a

    // concurrent edits on different ids
    upsertNode(a, node("newA", 10));
    upsertFlow(b, { id: "newF", source: "api", target: "db", label: "extra" });
    sync(a, b);

    const ma = readModel(a);
    const mb = readModel(b);
    expect(ma).toEqual(mb); // converged
    expect(ma.nodes.newA).toBeDefined();
    expect(ma.flows.newF).toBeDefined();
  });

  it("concurrent edits to the same field converge to one deterministic value", () => {
    const a = createDoc();
    const b = createDoc();
    writeModel(a, sampleModel());
    sync(a, b);
    upsertNode(a, node("api", 111));
    upsertNode(b, node("api", 222));
    sync(a, b);
    expect(readModel(a)).toEqual(readModel(b)); // no divergence
  });
});
