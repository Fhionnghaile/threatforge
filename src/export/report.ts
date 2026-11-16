/** Export a threat report (Markdown) and the model (JSON). */
import { Model, Threat } from "../model/types";
import { generateThreats } from "../threat/stride";

export function toJSON(model: Model): string {
  return JSON.stringify(model, null, 2);
}

export function toMarkdown(model: Model, threats?: Threat[]): string {
  const list = threats ?? generateThreats(model);
  const lines: string[] = [];
  lines.push("# Threat model report", "");
  lines.push(
    `**Elements:** ${Object.keys(model.nodes).length} · ` +
      `**Flows:** ${Object.keys(model.flows).length} · ` +
      `**Threats:** ${list.length}`,
    ""
  );
  lines.push("| # | Category | Target | Threat | Score |");
  lines.push("|---|---|---|---|---|");
  list.forEach((t, i) => {
    lines.push(`| ${i + 1} | ${t.category} | ${t.target} | ${t.title} | ${t.score} |`);
  });
  lines.push("");
  lines.push("## Detail", "");
  for (const t of list) {
    lines.push(`### ${t.title} (${t.category}, score ${t.score})`);
    lines.push(t.description, "");
  }
  return lines.join("\n");
}
