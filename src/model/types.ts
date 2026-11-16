/** Threat-model domain types. */

export type ElementKind = "process" | "store" | "external" | "boundary";

export interface NodeEl {
  id: string;
  kind: ElementKind;
  label: string;
  x: number;
  y: number;
  /** For a store: is it an append-only log? (affects Repudiation coverage) */
  isLog?: boolean;
  /** For a boundary: a rectangle other nodes may sit inside. */
  w?: number;
  h?: number;
}

export interface Flow {
  id: string;
  source: string; // node id
  target: string; // node id
  label: string;
}

export interface Model {
  nodes: Record<string, NodeEl>;
  flows: Record<string, Flow>;
}

export const STRIDE = [
  "Spoofing",
  "Tampering",
  "Repudiation",
  "InformationDisclosure",
  "DenialOfService",
  "ElevationOfPrivilege",
] as const;

export type StrideCategory = (typeof STRIDE)[number];

export interface Threat {
  id: string;
  category: StrideCategory;
  target: string; // "node:<id>" or "flow:<id>"
  title: string;
  description: string;
  score: number; // 1..10
}

export const emptyModel = (): Model => ({ nodes: {}, flows: {} });
