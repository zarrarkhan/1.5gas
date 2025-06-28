"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import RadialIndexChart from "@/components/RadialIndexChart";
import { parseCSV } from "@/lib/parseCSV";
import { useViewportHeight } from '@/lib/useViewportHeight';
import MapLegend from "@/components/MapLegend";

type CountryData = {
  name: string;
  iso: string;
  essIndex: number;
  indicators: Record<string, number>;
};

export default function CountryPage() {
  useViewportHeight();
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/essindex2025_all.csv");
      const text = await res.text();
      const parsed = parseCSV(text); // Map<ISO, { [key]: value }>

      // Turn into CountryData[]
      const countries: CountryData[] = [];

      text.split("\n")
        .slice(1)
        .forEach((line) => {
          const parts = line.split(",");
          const name = parts[0]?.trim();
          const iso = parts[1]?.trim();
          const essIndex = parseFloat(parts[2]);

          if (!name || !iso || isNaN(essIndex)) return;

          const indicators: Record<string, number> = {};
          const headers = [
            "1. Risk", "2. Labor", "3. Resources", "4. Health", "5. Land",
            "6. Biodiversity", "7. Inclusion", "8. Heritage", "9. Climate", "10. Engagement"
          ];

          headers.forEach((key, i) => {
            const val = parseFloat(parts[i + 3]);
            if (!isNaN(val)) indicators[key] = val;
          });

          countries.push({ name, iso, essIndex, indicators });
        });

      setAllCountries(countries);
      setSelectedCountry(countries.find(c => c.name === "Afghanistan") || null);
    };

    fetchData();
  }, []);

  const [chartSize, setChartSize] = useState(420);

  useEffect(() => {
    const handleResize = () => {
      setChartSize(window.innerWidth < 640 ? 320 : 420);
    };

    handleResize(); // Run once on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="w-full relative bg-gradient-to-b from-[#0b0c10] via-[#1a1f2b] to-[#0b0c10] text-white">
      <Navbar />
      <div className="min-h-screen w-full flex flex-col items-center px-6 pt-24 pb-12 text-center">
        {/* Country Selector */}
        <select
          className="text-white bg-gray-800 px-3 py-2 mb-8 rounded"
          onChange={(e) => {
            const selected = allCountries.find(c => c.name === e.target.value);
            setSelectedCountry(selected || null);
          }}
          value={selectedCountry?.name || ""}
        >
          {allCountries.map((country) => (
            <option key={country.iso} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>

        {/* Chart + Legend */}
        {selectedCountry && (
          <>
            <div className="flex flex-col items-center px-4 sm:px-8">
              <RadialIndexChart country={selectedCountry} size={chartSize} />
              <MapLegend className="mt-8" />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
