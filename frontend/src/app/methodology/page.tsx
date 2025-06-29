'use client';

import Navbar from '@/components/Navbar';
import { useViewportHeight } from '@/lib/useViewportHeight';

export default function MethodologyPage() {
  useViewportHeight();

  return (
    <main
      style={{ height: 'auto' }}
      className="relative w-full bg-gradient-to-b from-[#0b0c10] via-[#1a1f2b] to-[#0b0c10] text-white overflow-x-hidden"
    >
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />

        <section className="flex-1 pt-30 px-6 md:px-12 max-w-6xl mx-auto w-full pb-24">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold font-logo">Methods & Reproducibility</h1>
            <p className="text-gray-400 text-sm mt-2">Overview of the backend processing pipeline for harmonized IAM scenario data.</p>
          </div>

          {/* Content */}
          <div className="space-y-10 font-tagline leading-relaxed text-gray-300">
            {/* Backend Folder Structure */}
            <div>
              <h2 className="text-xl font-bold text-white mb-2">📁 Backend Folder Structure</h2>
              <pre className="bg-[#1a1f2b] p-4 rounded text-sm overflow-auto">
{`backend/
├── data/            # Input Excel and mapping files
├── scripts/         # step1_... to step6_... processing scripts
├── public_data/     # Output CSVs, JSONs, diagnostics
└── run.py           # Master pipeline script`}
              </pre>
            </div>

            {/* Step Table */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">⚙️ Pipeline Steps Overview</h2>
              <div className="overflow-auto rounded border border-gray-700">
                <table className="min-w-full text-sm text-gray-300 text-left">
                  <thead className="bg-[#1a1f2b] text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Step</th>
                      <th className="px-4 py-3">Script</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Input</th>
                      <th className="px-4 py-3">Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {[
                      {
                        step: '1',
                        script: 'step1_filter_beccs.py',
                        desc: 'Tags scenarios by BECCS level in 2050',
                        input: 'scenario_data.xlsx',
                        output: 'step1_scenario_type.csv',
                      },
                      {
                        step: '2',
                        script: 'step2_clean_electricity.py',
                        desc: 'Melts electricity data to long format',
                        input: 'scenario_data.xlsx',
                        output: 'step2_electricity_long.csv',
                      },
                      {
                        step: '3',
                        script: 'step3_standardize_timeseries.py',
                        desc: 'Interpolates, standardizes, and diagnoses',
                        input: 'step2_electricity_long.csv',
                        output: 'step3_standardized.csv + diagnostics',
                      },
                      {
                        step: '4',
                        script: 'step4_calculate_indicators.py',
                        desc: 'Calculates key indicators per scenario',
                        input: 'step3_standardized.csv',
                        output: 'step4_metrics.csv',
                      },
                      {
                        step: '5',
                        script: 'step5_aggregate_outputs.py',
                        desc: 'Generates regional summaries and gas share plots',
                        input: 'step3_standardized.csv + step1_scenario_type.csv',
                        output: 'CSV, JSON, PNG diagnostics',
                      },
                      {
                        step: '6',
                        script: 'step6_export_json.py',
                        desc: 'Exports frontend-ready JSON + moves files',
                        input: 'step5 outputs',
                        output: 'step6_scenario_table.json, region map, etc.',
                      },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#1f2735] transition">
                        <td className="px-4 py-3 font-medium">{row.step}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.script}</td>
                        <td className="px-4 py-3">{row.desc}</td>
                        <td className="px-4 py-3">{row.input}</td>
                        <td className="px-4 py-3">{row.output}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostic Visuals */}
            <div>
              <h2 className="text-xl font-bold text-white">📊 Diagnostic Visuals</h2>
              <p className="text-gray-400 mb-4 text-sm">Produced automatically during Step 3 and Step 5</p>

              <div className="space-y-8">
                {[
                  {
                    img: '/data/step3_diagnostics1_timeseries_by_variable.png',
                    caption: 'Step 3: Electricity & Gas Time Series – Before and After Harmonization',
                  },
                  {
                    img: '/data/step3_diagnostics2_timeline_heatmap.png',
                    caption: 'Step 3: Timeline Heatmap Showing Scenario Coverage by Model',
                  },
                  {
                    img: '/data/step3_diagnostics3_model_scenario_histogram.png',
                    caption: 'Step 3: Number of Scenarios per Model',
                  },
                  {
                    img: '/data/step5_diagnostic1_gas_share_timeseries_all_regions.png',
                    caption: 'Step 5: Gas Share in Electricity Over Time by Region and Scenario Type',
                  },
                ].map((fig, i) => (
                  <div key={i}>
                    <img src={fig.img} alt={fig.caption} className="w-full rounded-lg shadow" />
                    <p className="text-sm text-gray-400 mt-2 text-center">{fig.caption}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
