import { describe, it, expect } from "vitest";
import { toMarkdown, toJSON } from "../export/report";
import { generateThreats } from "../threat/stride";
import { sampleModel } from "../model/sample";

describe("report export", () => {
  it("markdown contains every generated threat", () => {
    const m = sampleModel();
    const threats = generateThreats(m);
    const md = toMarkdown(m, threats);
    expect(threats.length).toBeGreaterThan(0);
    for (const t of threats) expect(md).toContain(t.title);
    expect(md).toContain(`Threats:** ${threats.length}`);
  });

  it("JSON round-trips the model", () => {
    const m = sampleModel();
    expect(JSON.parse(toJSON(m))).toEqual(m);
  });
});
