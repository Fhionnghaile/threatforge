import { describe, it, expect } from "vitest";
import { generateThreats, ELEMENT_STRIDE, crossesBoundary } from "../threat/stride";
import { Model } from "../model/types";

function flowModel(sameZone: boolean): Model {
  // two processes; a boundary contains only the target unless sameZone
  return {
    nodes: {
      b: { id: "b", kind: "boundary", label: "zone", x: 100, y: 0, w: 200, h: 200 },
      a: { id: "a", kind: "process", label: "A", x: sameZone ? 150 : 10, y: 50 },
      c: { id: "c", kind: "process", label: "C", x: 150, y: 50 },
    },
    flows: { f: { id: "f", source: "a", target: "c", label: "x" } },
  };
}

describe("STRIDE rules engine", () => {
  it("a flow crossing a boundary yields the stronger STRIDE set", () => {
    const threats = generateThreats(flowModel(false));
    const flowCats = new Set(threats.filter((t) => t.target === "flow:f").map((t) => t.category));
    expect(flowCats).toContain("Tampering");
    expect(flowCats).toContain("InformationDisclosure");
    expect(flowCats).toContain("Spoofing"); // boundary crossing
    expect(flowCats).toContain("ElevationOfPrivilege"); // into a process
  });

  it("an internal flow (same zone) yields fewer threats than a crossing flow", () => {
    const crossing = generateThreats(flowModel(false)).filter((t) => t.target === "flow:f");
    const internal = generateThreats(flowModel(true)).filter((t) => t.target === "flow:f");
    expect(internal.length).toBeLessThan(crossing.length);
    const cats = new Set(internal.map((t) => t.category));
    expect(cats).toEqual(new Set(["Tampering", "InformationDisclosure"]));
  });

  it("crossesBoundary is false when endpoints share a zone", () => {
    expect(crossesBoundary(flowModel(true), flowModel(true).flows.f)).toBe(false);
    expect(crossesBoundary(flowModel(false), flowModel(false).flows.f)).toBe(true);
  });

  it("element kinds map to their inherent STRIDE sets (table-driven)", () => {
    expect(ELEMENT_STRIDE.process).toHaveLength(6);
    expect(new Set(ELEMENT_STRIDE.external)).toEqual(new Set(["Spoofing", "Repudiation"]));
    expect(ELEMENT_STRIDE.store).not.toContain("Spoofing");
  });

  it("a log store adds a Repudiation threat", () => {
    const m: Model = {
      nodes: { l: { id: "l", kind: "store", label: "Log", x: 0, y: 0, isLog: true } },
      flows: {},
    };
    const cats = new Set(generateThreats(m).map((t) => t.category));
    expect(cats).toContain("Repudiation");
  });
});
