"use client";

import { LEGEND_COLORS } from "@/lib/colors";

export default function MapLegend({ className = "" }: { className?: string }) {
  return (
    // This is now the top-level element returned by MapLegend
    // You can add the desired styling for the legend itself here.
    // I've kept 'flex-row gap-6 justify-center' to maintain the horizontal layout.
    <div className={`flex flex-row gap-6 justify-center ${className}`}>
      {LEGEND_COLORS.buckets.map((bucket, index) => (
        <div key={index} className="flex flex-col items-center min-w-[48px]">
          <span
            className="inline-block w-4 h-4 rounded-sm"
            style={{ backgroundColor: bucket.color }}
          ></span>
          <span className="text-[10px] text-gray-200 mt-1 whitespace-nowrap">
            {bucket.label}
          </span>
        </div>
      ))}

      {/* No Data entry */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span
          className="inline-block w-4 h-4 rounded-sm"
          style={{ backgroundColor: LEGEND_COLORS.noDataColor }}
        ></span>
        <span className="text-[10px] text-gray-300 mt-1 whitespace-nowrap">
          No Data
        </span>
      </div>
    </div>
  );
}