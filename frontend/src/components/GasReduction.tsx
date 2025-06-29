'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';
import { motion } from "framer-motion";

export default function GasReduction() {
  const [summary, setSummary] = useState<any>(null);
  const [scenario, setScenario] = useState<"Low-BECCS" | "High-BECCS">("Low-BECCS");
  const selectedData = summary?.[scenario]?.World ?? {};
  const chartData = selectedData.yearly ?? [];
  const value2020 = selectedData.ref_2020 ?? 0;
  const value2030 = selectedData.benchmark ?? 0;
  const reductionPct = selectedData.reduction_pct ?? 0;
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const benchmarkWorld = benchmarks?.[scenario]?.World;
  const effYear = benchmarkWorld?.gas_phaseout_years?.["effective_2.5pct"];
  const totYear = benchmarkWorld?.gas_phaseout_years?.total_1pct;

  useEffect(() => {
    fetch('/data/step5_gas_timeseries_summary.json')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error("Failed to load EJ gas summary:", err));
  }, []);

  useEffect(() => {
    fetch('/data/step5_benchmark_stats.json')
      .then(res => res.json())
      .then(data => setBenchmarks(data))
      .catch(err => console.error("Failed to load gas benchmarks:", err));
  }, []);


  return (
    <section
      id="insights"
      className="scroll-mt-12 w-full py-20 px-6 md:px-12 bg-gradient-to-b from-[#0b0c10] via-[#1a1f2b] to-[#0b0c10] text-white"
    >
      <h2 className="text-3xl font-bold mb-8 font-logo text-center">Global Gas Reduction by 2030</h2>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Buttons */}
        <div className="col-span-2 mb-6 text-center">
          {["Low-BECCS", "High-BECCS"].map((label) => {
            const isActive = scenario === label;
            return (
              <button
                key={label}
                onClick={() => setScenario(label as "Low-BECCS" | "High-BECCS")}
                className={`px-5 py-2 mx-2 rounded-full font-semibold border transition-all duration-300
          ${isActive
                    ? "bg-[#bfa76f] text-black border-[#d4bd87] shadow-sm"
                    : "bg-[#1a1f2b] text-gray-300 border-gray-600 hover:border-[#bfa76f] hover:text-[#d4bd87]"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Chart Section */}
        <motion.div
          className="w-full h-[400px] bg-gray-800 rounded-lg p-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h3 className="text-white text-xl font-semibold mb-4 text-center">
            Median line for {scenario} scenarios
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 40, right: 30, bottom: 60, left: 40 }}
            >
              <XAxis
                dataKey="year"
                type="number"
                domain={[2010, 2050]}
                ticks={[2010, 2020, 2030, 2050, 2100]}
                tick={{ fill: 'white', dy: 10 }}
                axisLine={{ stroke: 'white' }}
                tickLine={{ stroke: 'white' }}
              />
              <YAxis
                domain={[0, Math.ceil(value2020 * 1.2)]}
                unit=" EJ"
                tick={{ fill: 'white' }}
                axisLine={{ stroke: 'white' }}
                tickLine={{ stroke: 'white' }}
              />

              <Tooltip
                contentStyle={{ backgroundColor: '#1a1f2b', border: 'none', color: 'white' }}
                formatter={(val: any) => `${val.toFixed(2)} EJ`}
                labelFormatter={(label: number) => `Year: ${label}`}
              />

              {/* Median Line */}
              <Line
                type="monotone"
                dataKey="median"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Horizontal Reference Lines */}
              <ReferenceLine
                y={value2020}
                stroke="#facc15"
                strokeDasharray="3 3"
                label={{
                  value: `2020 ${value2020} EJ`,
                  fill: "#facc15",
                  position: "top",
                  dx: 60,
                  fontSize: 15,
                }}
              />
              <ReferenceLine
                y={value2030}
                stroke="#4ade80"
                strokeDasharray="3 3"
                label={{
                  value: `2030 ${value2030} EJ`,
                  fill: "#4ade80",
                  position: "bottom",
                  dx: 60,
                  fontSize: 15,
                }}
              />

              {/* Effective Phase-Out Line */}
              {effYear && (
                <ReferenceLine
                  x={effYear}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  label={{
                    value: `Effective (${effYear})`,
                    position: "insideTop",
                    fill: "#3b82f6",
                    fontSize: 12,
                    dy: 10, // adjust vertical position
                  }}
                />
              )}

              {/* Total Phase-Out Line */}
              {totYear && (
                <ReferenceLine
                  x={totYear}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Total (${totYear})`,
                    position: "insideTop",
                    fill: "#ef4444",
                    fontSize: 12,
                    dy: 25, // stacked below the effective label
                  }}
                />
              )}

              {/* Dots at intersections */}
              <ReferenceDot
                x={2020}
                y={value2020}
                r={4}
                fill="#facc15"
                stroke="white"
              />
              <ReferenceDot
                x={2030}
                y={value2030}
                r={4}
                fill="#4ade80"
                stroke="white"
              />

              {/* Down Arrow Annotation */}
              <ReferenceLine
                ifOverflow="extendDomain"
                segment={[
                  { x: 2085, y: value2020 },
                  { x: 2085, y: value2030 }
                ]}
                stroke="transparent"
                label={{
                  value: `↓ ${reductionPct}%`,
                  position: "middle",
                  fill: "#fb7185",
                  dx: -30,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Text Section */}
        <div className="space-y-4">
          <p className="text-lg text-muted leading-relaxed font-tagline">
            Global gas power generation must fall from{" "}
            <strong style={{ color: "#facc15" }}>{value2020} EJ</strong> in 2020 to{" "}
            <strong style={{ color: "#4ade80" }}>{value2030} EJ</strong> in 2030 — a reduction of{" "}
            <strong style={{ color: "#fb7185" }}>{reductionPct}%</strong> — to align with 1.5°C pathways that limit CCS deployment.
          </p>
          {(effYear || totYear) && (
            <p className="text-md text-muted font-tagline">
              Under the <strong>{scenario}</strong> scenario, gas power is expected to reach{" "}
              <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                effective phase-out (&lt;2.5%) by {effYear ?? "–"}
              </span>{" "}
              and{" "}
              <span style={{ color: "#ef4444", fontWeight: 600 }}>
                total phase-out (&lt;1%) by {totYear ?? "–"}
              </span>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
