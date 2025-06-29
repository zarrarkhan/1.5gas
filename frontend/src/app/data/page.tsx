'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Navbar from '@/components/Navbar';
import { useViewportHeight } from '@/lib/useViewportHeight';

interface DataRow {
    Year: string;
    Scenario_ID: string;
    Model: string;
    Scenario: string;
    Region: string;
    Variable: string;
    Unit: string;
    Value: string;
    Variable_clean: string;
    Variable_standardized: string;
}

const hiddenColumns = ['Variable_clean', 'Variable_standardized'];


export default function DataPage() {
    useViewportHeight();
    const [data, setData] = useState<DataRow[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetch('/data/step3_standardized.csv') // <-- make sure your CSV is here
            .then(res => res.text())
            .then(csv => {
                Papa.parse<DataRow>(csv, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => setData(results.data),
                });
            });
    }, []);

    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(filter.toLowerCase())
        )
    );

    return (
        <main
            className="relative w-full min-h-screen bg-gradient-to-b from-[#0b0c10] via-[#1a1f2b] to-[#0b0c10] text-white overflow-hidden"
        >
            <div className="relative z-10 min-h-screen flex flex-col">
                <Navbar />

                <section className="flex-1 pt-30 px-6 md:px-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold font-logo">Explore the Data</h1>
                        <p className="text-gray-400 text-sm mt-2">
                            Filter and download data from all models and scenarios.
                        </p>
                    </div>

                    <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-4 py-2 rounded-md text-white bg-[#1a1f2b] border border-gray-500 placeholder-gray-400 w-full md:max-w-sm"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />

                        {/* Download */}
                        <a
                            href="/data/your-data.csv"
                            download
                            className="bg-[#bfa76f] hover:bg-[#d4bd87] text-black px-4 py-2 rounded-md font-semibold"
                        >
                            Download Full CSV
                        </a>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-auto max-h-[60vh] border border-gray-700 rounded-lg mb-8">
                        <table className="min-w-[1000px] w-full text-sm text-left">
                            <thead className="bg-gray-800 text-gray-300 sticky top-0 z-10">
                                <tr>
                                    {data[0] &&
                                        Object.keys(data[0]).filter(key => !hiddenColumns.includes(key)).map((key) => (
                                            <th key={key} className="py-2 px-3 whitespace-nowrap">{key}</th>
                                        ))}
                                </tr>
                                <tr>
                                    {data[0] &&
                                        Object.keys(data[0]).filter(key => !hiddenColumns.includes(key)).map((key) => {
                                            const uniqueValues = Array.from(new Set(data.map(row => row[key as keyof DataRow]))).slice(0, 50); // Limit options
                                            return (
                                                <th key={`${key}-filter`} className="py-1 px-3">
                                                    <select
                                                        className="w-full text-sm bg-[#1a1f2b] text-white border border-gray-600 rounded"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "") {
                                                                setFilter(""); // Reset global filter
                                                            } else {
                                                                setFilter(val); // Simple single-field filter for now
                                                            }
                                                        }}
                                                    >
                                                        <option value="">All</option>
                                                        {uniqueValues.map((val, i) => (
                                                            <option key={i} value={String(val)}>
                                                                {String(val)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </th>
                                            );
                                        })}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.slice(0, 100).map((row, idx) => (
                                    <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800">
                                        {Object.entries(row)
                                            .filter(([key]) => !hiddenColumns.includes(key))
                                            .map(([_, val], i) => (
                                                <td key={i} className="py-2 px-3 whitespace-nowrap">{String(val)}</td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-400 mt-4 mb-12 text-center">
                        Showing {filteredData.slice(0, 100).length} of {filteredData.length} rows
                    </p>
                </section>
            </div>
        </main>
    );
}
