// components/MapLegend.tsx
"use client";

import { LEGEND_COLORS } from "@/lib/colors";

export default function MapLegend({ className = "" }: { className?: string }) {
  const gradient = `linear-gradient(to right, ${LEGEND_COLORS.stops.map(stop => stop.color).join(', ')})`;

  return (
    <div className={`map-legend ${className}`}>
      <div className="legend-gradient" style={{ background: gradient }} />
      <div className="legend-labels">
        <span>Low (0)</span>
        <span>High (10)</span>
      </div>
    </div>
  );
}