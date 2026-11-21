# ThreatForge — collaborative threat-modelling board — manual

*One page, eight blocks. Every figure here comes from this repository's own tests and README.*

## 1. Claim
Drawing an architecture generates STRIDE threats automatically, and two clients converge after concurrent and conflicting edits (CRDT, tested).

## 2. What it is
A shared whiteboard for threat modelling. Draw components and data flows, get the likely threats generated for you, edit with colleagues in real time, and export a report.

## 3. Demo
Live board locally: `npm run dev`, then open http://localhost:5173. Capture to record: drawing a cross-boundary flow and the threats appearing.

## 4. Run it yourself
**Prerequisites:** Node.js and npm.

```bash
npm ci
npm test
npm run build
npm run dev
```

## 5. What you will see
15 Vitest tests pass and the build is clean.

## 6. 30-second talking point
> Threat models usually die as stale diagrams. ThreatForge makes the model live and shared, and generates the threats from what is drawn, so updating the diagram updates the threats.

## 7. Scope and limits
- STRIDE heuristics surface candidate threats. Expert judgement still prioritises them.
- Live multi-user needs a y-websocket provider. The tests use the offline sync path.

## 8. Links
[Repository](https://github.com/fhionnghaile/threatforge) · [Write-up](https://padraigfhionnghaile.com/work/threatforge/) · [README](README.md)
