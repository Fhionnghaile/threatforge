# ThreatForge — collaborative threat-modelling board

<!-- at-a-glance -->
> **A collaborative threat-modelling board: draw an architecture, get STRIDE threats, edit it live with others.**  
> **Result:** 15 Vitest tests + a clean build; CRDT convergence tested.  
> **Reproduce:** `npm ci && npm test`  
> ![CI](https://github.com/fhionnghaile/threatforge/actions/workflows/ci.yml/badge.svg) [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Fhionnghaile/threatforge/badge)](https://scorecard.dev/viewer/?uri=github.com/Fhionnghaile/threatforge)
>
> **What this is worth:** Makes threat modelling a live team activity with an exportable report, instead of a stale diagram nobody updates.


Drag components and data flows onto a board; ThreatForge **auto-generates STRIDE
threats** from the model, syncs edits between clients in real time (CRDT), and exports
a threat report. React + TypeScript, tested with Vitest.

> **What it proves:** React, real-time collaborative state (Yjs CRDT), an SVG canvas,
> and applied security knowledge (the STRIDE rule engine).

## Architecture — logic is separated from the canvas

```
src/
  model/
    types.ts      domain types (elements, flows, STRIDE categories, threats)
    reducer.ts    pure model reducer + undo/redo history
    sample.ts     a demo web-app model that spans a trust boundary
  threat/
    stride.ts     the STRIDE rules engine (pure, table-driven)
  sync/
    crdt.ts       Yjs binding: project the model onto a Y.Doc; concurrent edits converge
  export/
    report.ts     Markdown threat report + model JSON
  components/
    Board.tsx     SVG canvas with pointer-drag nodes, boundaries, data flows
  App.tsx         wires reducer + threats + board + export
```

The security logic and the collaborative state are **pure functions**, so they're
tested without a browser; only the drag interaction needs the DOM.

## The STRIDE engine

Two rule sources (`threat/stride.ts`):

1. **STRIDE-per-element** — each element kind carries its inherent set (a process is
   subject to all six; an external entity to Spoofing + Repudiation; a store to
   Tampering / Information Disclosure / DoS, plus Repudiation if it's an append-only log).
2. **Data-flow rules** — every flow gets Tampering + Information Disclosure; a flow that
   **crosses a trust boundary** additionally gets Spoofing, and Elevation of Privilege
   when it enters a process. Boundary crossing is computed from node geometry.

## Run it

```bash
npm install
npm test          # vitest: 15 tests
npm run build     # tsc + vite production build
npm run dev       # live board at http://localhost:5173
```

## What the tests pin down (the spec's acceptance cases)

| Test | Guarantee |
|------|-----------|
| `stride.test.ts` | A boundary-crossing flow yields the expected STRIDE set; an internal flow yields fewer (table-driven); element kinds map correctly; a log store adds Repudiation |
| `reducer.test.ts` | Add / move / delete node (flows cascade on delete); **undo restores, redo re-applies**; no-ops don't pollute history |
| `crdt.test.ts` | Two clients **converge** after concurrent, and after conflicting, edits |
| `report.test.ts` | The exported report contains **every** generated threat; JSON round-trips |
| `board.test.tsx` | Dragging a node updates its position in state (RTL) |

## Notes

- Real-time transport is Yjs; `sync/crdt.ts` exposes an offline `sync()` used by the
  tests. A `y-websocket` provider drops in for live multi-user without touching the model.
- `src/test/setup.ts` polyfills jsdom's `PointerEvent` (it otherwise drops coordinates),
  so the drag test reflects real-browser behaviour.

## Key decisions

- Yjs CRDT for real-time multiplayer editing without a central lock — convergence is tested.
- A table-driven STRIDE engine, so threats are generated from the drawn model.
- Exports a threat report, closing the loop from diagram to action.

## Scope & limits

- STRIDE heuristics surface candidate threats; expert judgement still prioritises them.

