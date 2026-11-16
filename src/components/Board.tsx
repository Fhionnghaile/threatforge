import React, { useRef } from "react";
import { Model } from "../model/types";
import { HistoryAction } from "../model/reducer";

const KIND_COLOR: Record<string, string> = {
  process: "#2f6df6",
  store: "#1f9d6b",
  external: "#d9870b",
  boundary: "transparent",
};

export function Board({
  model,
  dispatch,
}: {
  model: Model;
  dispatch: React.Dispatch<HistoryAction>;
}) {
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  function onPointerDown(e: React.PointerEvent, id: string) {
    const n = model.nodes[id];
    drag.current = { id, dx: e.clientX - n.x, dy: e.clientY - n.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    dispatch({
      type: "MOVE_NODE",
      id: drag.current.id,
      x: e.clientX - drag.current.dx,
      y: e.clientY - drag.current.dy,
    });
  }
  function onPointerUp() {
    drag.current = null;
  }

  return (
    <svg
      ref={svgRef}
      width={680}
      height={400}
      role="img"
      aria-label="threat model board"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ background: "#f6f7f9", borderRadius: 10 }}
    >
      {Object.values(model.nodes)
        .filter((n) => n.kind === "boundary")
        .map((b) => (
          <rect
            key={b.id}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill="none"
            stroke="#9aa7bd"
            strokeDasharray="6 4"
            rx={10}
          />
        ))}
      {Object.values(model.flows).map((f) => {
        const s = model.nodes[f.source];
        const t = model.nodes[f.target];
        if (!s || !t) return null;
        return (
          <line
            key={f.id}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke="#5b6472"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
        );
      })}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#5b6472" />
        </marker>
      </defs>
      {Object.values(model.nodes)
        .filter((n) => n.kind !== "boundary")
        .map((n) => (
          <g
            key={n.id}
            data-testid={`node-${n.id}`}
            transform={`translate(${n.x},${n.y})`}
            onPointerDown={(e) => onPointerDown(e, n.id)}
            style={{ cursor: "grab" }}
          >
            <circle r={16} fill={KIND_COLOR[n.kind]} />
            <text x={22} y={5} fontSize={12} fill="#1c2230">
              {n.label}
            </text>
          </g>
        ))}
    </svg>
  );
}
