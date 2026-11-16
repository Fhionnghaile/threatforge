/**
 * STRIDE threat generation — a pure, table-driven rules engine.
 *
 * Two sources of threats:
 *  1. STRIDE-per-element: each element kind is inherently subject to a fixed
 *     STRIDE set (the classic Microsoft mapping).
 *  2. Data-flow rules: a flow gets Tampering + Information Disclosure, and a flow
 *     that CROSSES A TRUST BOUNDARY additionally gets stronger threats
 *     (Spoofing of the source, and Elevation of Privilege when it enters a process).
 */
import { Model, NodeEl, Flow, StrideCategory, Threat } from "../model/types";

/** Inherent STRIDE categories by element kind. */
export const ELEMENT_STRIDE: Record<NodeEl["kind"], StrideCategory[]> = {
  process: [
    "Spoofing",
    "Tampering",
    "Repudiation",
    "InformationDisclosure",
    "DenialOfService",
    "ElevationOfPrivilege",
  ],
  store: ["Tampering", "InformationDisclosure", "DenialOfService"],
  external: ["Spoofing", "Repudiation"],
  boundary: [], // a boundary is context, not an element with its own threats
};

const SEVERITY: Record<StrideCategory, number> = {
  Spoofing: 6,
  Tampering: 7,
  Repudiation: 4,
  InformationDisclosure: 7,
  DenialOfService: 5,
  ElevationOfPrivilege: 9,
};

/** Does point (px,py) fall inside boundary node b? */
function inside(b: NodeEl, px: number, py: number): boolean {
  const w = b.w ?? 0;
  const h = b.h ?? 0;
  return px >= b.x && px <= b.x + w && py >= b.y && py <= b.y + h;
}

/** Which boundary (if any) contains a node's position. */
function boundaryOf(model: Model, n: NodeEl): string | null {
  for (const b of Object.values(model.nodes)) {
    if (b.kind === "boundary" && inside(b, n.x, n.y)) return b.id;
  }
  return null;
}

/** True when the flow's endpoints sit in different trust zones. */
export function crossesBoundary(model: Model, flow: Flow): boolean {
  const s = model.nodes[flow.source];
  const t = model.nodes[flow.target];
  if (!s || !t) return false;
  return boundaryOf(model, s) !== boundaryOf(model, t);
}

function mk(
  category: StrideCategory,
  target: string,
  title: string,
  description: string,
  bump = 0
): Threat {
  return {
    id: `${target}:${category}`,
    category,
    target,
    title,
    description,
    score: Math.min(10, SEVERITY[category] + bump),
  };
}

/** Generate the full, de-duplicated threat list for a model (pure). */
export function generateThreats(model: Model): Threat[] {
  const out: Threat[] = [];

  // 1. per-element inherent threats
  for (const n of Object.values(model.nodes)) {
    for (const cat of ELEMENT_STRIDE[n.kind]) {
      out.push(
        mk(cat, `node:${n.id}`, `${cat} against ${n.label}`,
          `${n.kind} "${n.label}" is inherently subject to ${cat}.`)
      );
    }
    if (n.kind === "store" && n.isLog) {
      out.push(
        mk("Repudiation", `node:${n.id}`, `Repudiation against ${n.label}`,
          `Log store "${n.label}" must be tamper-evident or actions can be repudiated.`)
      );
    }
  }

  // 2. data-flow threats
  for (const f of Object.values(model.flows)) {
    const s = model.nodes[f.source];
    const t = model.nodes[f.target];
    if (!s || !t) continue;
    const label = f.label || `${s.label}→${t.label}`;
    out.push(
      mk("Tampering", `flow:${f.id}`, `Tampering of ${label}`,
        `Data in flow "${label}" could be modified in transit.`)
    );
    out.push(
      mk("InformationDisclosure", `flow:${f.id}`, `Disclosure of ${label}`,
        `Data in flow "${label}" could be observed in transit.`)
    );
    if (crossesBoundary(model, f)) {
      out.push(
        mk("Spoofing", `flow:${f.id}`, `Spoofing across boundary on ${label}`,
          `Flow "${label}" crosses a trust boundary; the source identity can be spoofed.`, 1)
      );
      if (t.kind === "process") {
        out.push(
          mk("ElevationOfPrivilege", `flow:${f.id}`, `EoP into ${t.label} via ${label}`,
            `Untrusted input crossing a boundary into process "${t.label}" risks privilege escalation.`, 0)
        );
      }
    }
  }

  // de-dupe by id, keep the highest score
  const byId = new Map<string, Threat>();
  for (const th of out) {
    const prev = byId.get(th.id);
    if (!prev || th.score > prev.score) byId.set(th.id, th);
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}
