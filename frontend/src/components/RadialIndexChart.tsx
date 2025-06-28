"use client";

import { useMemo } from "react";
import * as d3 from "d3";
import { INDEX_KEYS, LEGEND_COLORS } from "@/lib/colors";

const getColorForValue = (() => {
  const scale = d3.scaleLinear<string>()
    .domain(LEGEND_COLORS.stops.map(stop => stop.value))
    .range(LEGEND_COLORS.stops.map(stop => stop.color))
    .clamp(true); // ensure values outside domain are clamped

  return (value: number): string => scale(value);
})();

type CountryData = {
    name: string;
    essIndex: number;
    indicators: Record<string, number>;
};

type Props = {
    country: CountryData;
    size?: number;
};

export default function RadialIndexChart({ country, size = 400 }: Props) {
    const indicatorEntries = INDEX_KEYS.map((key, i) => {
        const raw = country.indicators[key];
        const value = typeof raw === "string" ? parseFloat(raw) : raw;
        return [key, isNaN(value) ? 0 : value] as [string, number];
    });
    const data = indicatorEntries.map(([key, value], i) => ({
        key,
        value,
        color: getColorForValue(value),
    }));

    const arcs = useMemo(() => {
        const max = 10;
        const innerRadius = size * 0.25;
        const outerRadius = (val: number) => innerRadius + (size * 0.25 * (val / max));
        const angleStep = (2 * Math.PI) / data.length;

        const arcGen = d3.arc<any>().innerRadius(innerRadius).padAngle(0).cornerRadius(2);

        return data.map((d, i) => {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;

            const arcPath = arcGen({
                outerRadius: outerRadius(d.value),
                startAngle,
                endAngle,
            })!;

            const labelRadius = size * 0.52; // fixed, consistent distance for outer labels
            const valueLabelRadius = size * 0.36; // slightly inside the arc, also fixed

            const labelArcGen = d3.arc<any>()
                .innerRadius(labelRadius)
                .outerRadius(labelRadius)
                .startAngle(startAngle)
                .endAngle(endAngle);

            const valueArcGen = d3.arc<any>()
                .innerRadius(valueLabelRadius)
                .outerRadius(valueLabelRadius)
                .startAngle(startAngle)
                .endAngle(endAngle);

            return {
                path: arcPath,
                color: d.color,
                label: d.key,
                value: d.value,
                labelArcPath: labelArcGen({}),
                valueArcPath: valueArcGen({}),
            };
        });
    }, [data, size]);

    const center = size / 2;

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <svg
                width={size}
                height={size}
                viewBox={`-30 -30 ${size + 60} ${size + 60}`}
                className="mx-auto"
            >
                <g transform={`translate(${center}, ${center})`}>
                    {/* Arcs */}
                    {arcs.map((arc, i) => (
                        <path key={i} d={arc.path} fill={arc.color} />
                    ))}

                    {/* Index Labels (curved outside) */}
                    {arcs.map((arc, i) => (
                        <text key={`label-${i}`} fill="white" fontSize="10" style={{ pointerEvents: "none" }}>
                            <textPath href={`#label-path-${i}`} startOffset="25%" textAnchor="middle">
                                {arc.label}
                            </textPath>
                            <path id={`label-path-${i}`} d={arc.labelArcPath!} fill="none" />
                        </text>
                    ))}

                    {/* Value Labels (further outside arc path) */}
                    {arcs.map((arc, i) => (
                        <text key={`value-${i}`} fill="white" fontSize="14" fontWeight="bold" style={{ pointerEvents: "none" }}>
                            <textPath href={`#value-path-${i}`} startOffset="25%" textAnchor="middle">
                                {arc.value === 0 ? ' ' : arc.value.toFixed(1)}
                            </textPath>
                            <path id={`value-path-${i}`} d={arc.valueArcPath!} fill="none" />
                        </text>
                    ))}
                </g>
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none z-20">
                <h2
                    className={[
                        size < 400 ? "text-base" : "text-xl",
                        "font-semibold !text-white drop-shadow-sm max-w-[60%] break-words"
                    ].join(" ")}
                >
                    {country.name}
                </h2>
                <p
                    className={[
                        size < 400 ? "text-xs" : "text-sm",
                        "mt-1 drop-shadow-sm"
                    ].join(" ")}
                >
                    <span className="text-blue-200">ESS Index: </span>
                    <span className="!text-white font-semibold">{country.essIndex}</span>
                </p>
            </div>
        </div>
    );
}
