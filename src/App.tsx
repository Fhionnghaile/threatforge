import { useReducer, useMemo } from "react";
import { historyReducer, initHistory } from "./model/reducer";
import { sampleModel } from "./model/sample";
import { generateThreats } from "./threat/stride";
import { toMarkdown } from "./export/report";
import { Board } from "./components/Board";

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () =>
    initHistory(sampleModel())
  );
  const model = history.present;
  const threats = useMemo(() => generateThreats(model), [model]);

  function download() {
    const blob = new Blob([toMarkdown(model, threats)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "threat-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 22 }}>ThreatForge — collaborative threat modelling</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => dispatch({ type: "UNDO" })} disabled={history.past.length === 0}>
          Undo
        </button>
        <button onClick={() => dispatch({ type: "REDO" })} disabled={history.future.length === 0}>
          Redo
        </button>
        <button onClick={download}>Export report</button>
      </div>
      <Board model={model} dispatch={dispatch} />
      <h2 style={{ fontSize: 16 }}>Generated STRIDE threats ({threats.length})</h2>
      <ul>
        {threats.map((t) => (
          <li key={t.id}>
            <strong>{t.category}</strong> — {t.title} <em>(score {t.score})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
