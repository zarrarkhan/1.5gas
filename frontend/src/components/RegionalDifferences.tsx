'use client';

import { useEffect, useState, useCallback } from 'react';
import MapGL, { Source, Layer, MapEvent } from 'react-map-gl/mapbox';
import type { AnyLayer } from 'mapbox-gl';
import { FeatureCollection, Feature } from 'geojson';
import { LEGEND_COLORS } from '@/lib/colors';
import MapLegend from '@/components/MapLegend';


// Import Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const getColorLayer = (indexKey: string): any => ({
  id: 'region-layer',
  type: 'fill',
  source: 'countries-data',
  paint: {
    'fill-color': [
      'case',
      ['has', indexKey],
      [
        'step',
        ['get', indexKey],
        LEGEND_COLORS.buckets[0].color,
        ...LEGEND_COLORS.buckets.slice(1).flatMap(bucket => [bucket.value, bucket.color])
      ],
      LEGEND_COLORS.noDataColor
    ],
    'fill-opacity': 0.85
  }
});

const getColorForValue = (value: number | null): string => {
  if (value === null || value === undefined) return LEGEND_COLORS.noDataColor;
  for (const bucket of LEGEND_COLORS.buckets) {
    if (value <= bucket.value) return bucket.color;
  }
  return LEGEND_COLORS.noDataColor;
};

// Define colors for the bar chart
const LOW_BECCS_BAR_COLOR = '#2196F3'; // A shade of blue
const HIGH_BECCS_BAR_COLOR = '#4CAF50'; // A shade of green

export default function RegionalDifferences() {
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [scenario, setScenario] = useState<"Low-BECCS" | "High-BECCS">("Low-BECCS");
  const [firstSymbolLayerId, setFirstSymbolLayerId] = useState<string | undefined>(undefined);
  // New state for chart data
  const [regionChartData, setRegionChartData] = useState<any[] | null>(null);

  const indexKey = scenario === "Low-BECCS" ? "Low-BECCS Reduction" : "High-BECCS Reduction";

  useEffect(() => {
    const load = async () => {
      const [geoRes, regionRes, mapRes] = await Promise.all([
        fetch(GEOJSON_URL),
        fetch('/data/step5_region_summary.json'),
        fetch('/data/step6_country_region_map.json')
      ]);

      const geoJson = await geoRes.json();
      const regionData = await regionRes.json();
      const regionMap = await mapRes.json();

      // Build region → value map for each BECCS type
      const valuesByRegion: Record<"Low-BECCS" | "High-BECCS", Record<string, number | null>> = {
        "Low-BECCS": {},
        "High-BECCS": {}
      };

      const allRegions: string[] = Object.keys(regionData);

      for (const region of allRegions) {
        for (const type of ["Low-BECCS", "High-BECCS"] as const) {
          valuesByRegion[type][region] = regionData[region][type]?.pct_drop ?? null;
        }
      }

      // Prepare data for the bar chart
      const chartData = allRegions.map(region => ({
        region: region,
        "Low-BECCS": valuesByRegion["Low-BECCS"][region],
        "High-BECCS": valuesByRegion["High-BECCS"][region],
      }));
      // Sort regions alphabetically for consistent chart display
      // Replace with this:
      chartData.sort((a, b) => {
        const valA = a[scenario] ?? -Infinity;
        const valB = b[scenario] ?? -Infinity;
        return valB - valA; // descending order
      });
      setRegionChartData(chartData);


      // Build ISO_A3 → pct_drop map based on region assignment
      const isoToPctDrop: Record<string, { Low: number | null, High: number | null }> = {};
      regionMap.forEach(({ ISO_A3, Region }: any) => {
        const low = valuesByRegion["Low-BECCS"][Region];
        const high = valuesByRegion["High-BECCS"][Region];
        if (low !== undefined || high !== undefined) {
          isoToPctDrop[ISO_A3] = {
            Low: low ?? null,
            High: high ?? null
          };
        }
      });

      // Enrich geojson features with new values
      const enriched = geoJson.features.map((f: Feature) => {
        const iso = f.properties?.['ISO3166-1-Alpha-3'];
        const regionValues = isoToPctDrop[iso];
        if (regionValues) {
          f.properties = {
            ...f.properties,
            "Low-BECCS Reduction": regionValues.Low,
            "High-BECCS Reduction": regionValues.High
          };
        }
        return f;
      });

      setGeoJsonData({ ...geoJson, features: enriched });
    };

    load();
  }, []);

  const onMapLoad = useCallback((event: MapEvent) => {
    const map = event.target;
    const layers = map.getStyle().layers;

    const firstSymbolId = layers.find(l => l.type === 'symbol')?.id;
    setFirstSymbolLayerId(firstSymbolId);

    // Get color from CSS variable for halo - ensure it's a dark background friendly color
    const rootStyle = getComputedStyle(document.documentElement);
    // Changed haloColor to a darker shade for dark theme
    const haloColor = rootStyle.getPropertyValue('--color-text-base').trim() || '#1A202C';

    layers.forEach((layer: AnyLayer) => {
      if (layer.type === 'symbol') {
        map.setPaintProperty(layer.id, 'text-color', '#FFFFFF'); // Keep text white for visibility
        map.setPaintProperty(layer.id, 'text-opacity', 1);
        map.setPaintProperty(layer.id, 'text-halo-color', haloColor);
        map.setPaintProperty(layer.id, 'text-halo-width', 1);
        map.setPaintProperty(layer.id, 'text-halo-blur', 0);
      }

      if (layer.type === 'line' && layer.id.includes('admin')) {
        map.setPaintProperty(layer.id, 'line-color', 'rgba(255, 255, 255, 0.25)'); // White lines with opacity
        map.setPaintProperty(layer.id, 'line-width', 0.75);
      }
    });
  }, []);

  return (
    <section className="w-full py-20 px-6 md:px-12 bg-gradient-to-t from-[#0b0c10] via-[#1a1f2b] to-[#0b0c10] text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-logo text-center">Regional Differences</h2>
        {/* Buttons */}
        <div className="mb-6 text-center">
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

        {/* Dynamic Paragraph - full width, consistent tone */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <p className="text-lg text-muted leading-relaxed font-tagline">
            {scenario === "Low-BECCS" ? (
              <>
                Under <strong>Low-BECCS</strong>, <strong>Latin America</strong> and <strong>OECD countries</strong> must reduce gas use by over <strong>70%</strong> by 2030. <strong>Russia and Central Asia</strong>: <strong>50%</strong>, <strong>Middle East and Africa</strong>: <strong>~30%</strong>, and <strong>Asia</strong>: <strong>9.6%</strong>.
              </>
            ) : (
              <>
                Under <strong>High-BECCS</strong>, <strong>Latin America</strong> still faces the largest reduction at <strong>73%</strong>. <strong>OECD countries</strong>: <strong>49.7%</strong>, <strong>Russia and Central Asia</strong>: <strong>37%</strong>, <strong>Middle East and Africa</strong>: <strong>33.6%</strong>, and <strong>Asia</strong>: <strong>20.3%</strong>.
              </>
            )}
          </p>
        </div>

        {/* Legend - now below the chart/map combined container */}
        <div className="w-full flex justify-center mt-6 mb-6">
          <MapLegend />
        </div>

        {/* New Flex Container for Chart and Map */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bar Chart Container */}
          {/* Changed background and text colors for dark theme */}
          <div className="w-full lg:w-1/2 h-[420px] bg-[#1a1f2b] p-4 rounded-lg shadow flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Regional Reduction %</h3>
            <div className="flex-grow"> {/* This div ensures the chart fills available space */}
              {regionChartData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4a5568" /> {/* Darker grid lines */}
                    <XAxis
                      dataKey="region"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fill: '#e2e8f0' }} // Lighter tick labels
                    />
                    <YAxis
                      tickFormatter={(value: number) => `${value}%`}
                      domain={[0, 100]}
                      tick={{ fill: '#e2e8f0' }} // Lighter tick labels
                    />
                    <Tooltip
                      formatter={(value: number | null, name: string, props: any) => value !== null ? `${value.toFixed(1)}%` : 'N/A'}
                      labelFormatter={(label: string) => `Region: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(26, 31, 43, 0.9)', // Darker tooltip background
                        border: '1px solid #4a5568', // Darker border
                        color: '#e2e8f0' // Lighter tooltip text
                      }}
                    />

                    <Bar
                      dataKey={scenario}
                      name={`${scenario} Reduction`}
                      fill="#8884d8"
                    >
                      {
                        regionChartData?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getColorForValue(entry[scenario])}
                          />
                        ))
                      }
                    </Bar>

                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="w-full lg:w-1/2 h-[420px] rounded-lg overflow-hidden shadow">
            <MapGL
              initialViewState={{ longitude: 10, latitude: 20, zoom: 1.5 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11" // Ensure dark map style
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              interactiveLayerIds={['region-layer']}
              projection={{ name: 'mercator' }}
              onLoad={onMapLoad}
            >
              {geoJsonData && (
                <Source type="geojson" data={geoJsonData}>
                  <Layer {...getColorLayer(indexKey)} beforeId={firstSymbolLayerId} />
                </Source>
              )}
            </MapGL>
          </div>
        </div>


      </div>
    </section>
  );
}