import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

describe("Board interaction", () => {
  it("renders generated threats from the sample model", () => {
    render(<App />);
    expect(screen.getByText(/Generated STRIDE threats/)).toBeInTheDocument();
  });

  it("dragging a node updates its position in state", () => {
    render(<App />);
    const group = screen.getByTestId("node-api");
    const before = group.getAttribute("transform");
    fireEvent.pointerDown(group, { clientX: 400, clientY: 120, pointerId: 1 });
    fireEvent.pointerMove(screen.getByLabelText("threat model board"), {
      clientX: 500,
      clientY: 200,
      pointerId: 1,
    });
    fireEvent.pointerUp(screen.getByLabelText("threat model board"), { pointerId: 1 });
    const after = screen.getByTestId("node-api").getAttribute("transform");
    expect(after).not.toEqual(before);
    expect(after).toContain("translate(500,200)");
  });
});
