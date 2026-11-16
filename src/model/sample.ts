import { Model } from "./types";

/** A small web-app threat model spanning a trust boundary. */
export const sampleModel = (): Model => ({
  nodes: {
    internet: { id: "internet", kind: "boundary", label: "Internet", x: 20, y: 20, w: 260, h: 360 },
    dmz: { id: "dmz", kind: "boundary", label: "Server zone", x: 320, y: 20, w: 320, h: 360 },
    user: { id: "user", kind: "external", label: "Browser user", x: 80, y: 120 },
    api: { id: "api", kind: "process", label: "API service", x: 400, y: 120 },
    db: { id: "db", kind: "store", label: "Postgres", x: 400, y: 260 },
    audit: { id: "audit", kind: "store", label: "Audit log", x: 540, y: 260, isLog: true },
  },
  flows: {
    f1: { id: "f1", source: "user", target: "api", label: "HTTPS request" },
    f2: { id: "f2", source: "api", target: "db", label: "SQL query" },
    f3: { id: "f3", source: "api", target: "audit", label: "write audit" },
  },
});
