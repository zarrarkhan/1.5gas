"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import MapGL, { Source, Layer, MapMouseEvent, Popup, MapEvent } from 'react-map-gl/mapbox';
import type { AnyLayer } from 'mapbox-gl';
import type { FeatureCollection, Feature } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LEGEND_COLORS, INDEX_KEYS } from "@/lib/colors";
import { parseCSV } from "@/lib/parseCSV";
import { useViewportHeight } from '@/lib/useViewportHeight';
import MapLegend from "@/components/MapLegend";
import Navbar from '../../components/Navbar';
import RadialIndexChart from "@/components/RadialIndexChart";
import Link from 'next/link';

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';


const getDataLayerStyle = (indexKey: string): AnyLayer => ({
  id: 'countries-data',
  type: 'fill',
  source: 'countries-data', // ✅ required field!
  paint: {
    'fill-color': [
      'case',
      ['has', indexKey],
      [
        'interpolate',
        ['linear'],
        ['get', indexKey],
        ...LEGEND_COLORS.stops.flatMap(stop => [stop.value, stop.color])
      ],
      LEGEND_COLORS.noDataColor
    ],
    'fill-opacity': 0.85
  }
});

export default function Dashboard() {
  useViewportHeight();
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    feature: Feature;
  } | null>(null);
  const [firstSymbolLayerId, setFirstSymbolLayerId] = useState<string | undefined>(undefined);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoJsonResponse, csvResponse] = await Promise.all([
          fetch(GEOJSON_URL),
          fetch('/essindex2025_all.csv')
        ]);

        const geoJson = await geoJsonResponse.json();
        const csvText = await csvResponse.text();
        const essData = parseCSV(csvText);
        console.log("Parsed ESS CSV entries:", Array.from(essData.entries()).slice(0, 5));
        console.log("Example key:", Array.from(essData.keys())[0]);


        const enrichedFeatures = geoJson.features.map((feature: Feature) => {
          const countryISO = feature.properties?.['ISO3166-1-Alpha-3'];
          const countryData = essData.get(countryISO);

          if (countryData) {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                ...countryData.indicators, // 👈 this is critical
                name: countryData.name,
                iso: countryData.iso,
                "ESS Index": countryData.essIndex // if you want it available like other indicators
              }
            };
          }

          return feature;
        });

        setGeoJsonData({ ...geoJson, features: enrichedFeatures });

      } catch (error) {
        console.error("An error occurred in the fetchData function:", error);
      }
    };

    fetchData();
  }, []);

  const onMapLoad = useCallback((event: MapEvent) => {
    const map = event.target;
    const layers = map.getStyle().layers;

    const firstSymbolId = layers.find(l => l.type === 'symbol')?.id;
    setFirstSymbolLayerId(firstSymbolId);

    const rootStyle = getComputedStyle(document.documentElement);
    const haloColor = rootStyle.getPropertyValue('--color-text-base').trim();

    layers.forEach((layer: AnyLayer) => {
      if (layer.type === 'symbol') {
        map.setPaintProperty(layer.id, 'text-color', '#FFFFFF');
        map.setPaintProperty(layer.id, 'text-opacity', 1);
        map.setPaintProperty(layer.id, 'text-halo-color', haloColor || '#1A202C');
        map.setPaintProperty(layer.id, 'text-halo-width', 1);
        map.setPaintProperty(layer.id, 'text-halo-blur', 0);
      }

      if (layer.type === 'line' && layer.id.includes('admin')) {
        map.setPaintProperty(layer.id, 'line-color', 'rgba(255, 255, 255, 0.25)');
        map.setPaintProperty(layer.id, 'line-width', 0.75);
      }
    });
  }, []);


  const hoveredISO = hoverInfo?.feature?.properties?.['ISO3166-1-Alpha-3'];

  const highlightLayers = useMemo(() => {
    if (!hoveredISO) {
      return [];
    }

    const filter = ['==', ['get', 'ISO3166-1-Alpha-3'], hoveredISO];

    const casingLayer: AnyLayer = {
      id: 'countries-highlight-casing',
      type: 'line',
      source: 'countries-data',
      filter: filter,
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 4,
        'line-blur': 2
      }
    };

    const inlineLayer: AnyLayer = {
      id: 'countries-highlight-inline',
      type: 'line',
      source: 'countries-data',
      filter: filter,
      paint: {
        'line-color': '#004C80',
        'line-width': 2
      }
    };

    return [casingLayer, inlineLayer];
  }, [hoveredISO]);


  const onHover = (event: MapMouseEvent) => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];

    if (hoveredFeature) {
      setHoverInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        feature: hoveredFeature
      });
    } else {
      setHoverInfo(null);
    }
  };

  const [selectedIndex, setSelectedIndex] = useState("ESS Index");

  return (
    <main>
      <Navbar />
      <div style={{ height: 'calc(var(--vh, 1vh) * 100)' }} className="w-full relative">
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-4">
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="map-selector"
          >
            <option value="ESS Index">ESS Index</option>
            {INDEX_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <Link href="/dashboard/split">
            <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
              Split View
            </button>
          </Link>
        </div>
        <MapGL
          initialViewState={{ longitude: 10, latitude: 30, zoom: 2 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          projection={{ name: 'mercator' }}
          minZoom={1}
          maxZoom={18}
          interactiveLayerIds={['countries-data']}
          onMouseMove={onHover}
          onLoad={onMapLoad}
        >
          {geoJsonData && (
            <Source type="geojson" data={geoJsonData}>
              <Layer {...getDataLayerStyle(selectedIndex)} beforeId={firstSymbolLayerId} />
              {highlightLayers.map(layer => (
                <Layer {...layer} key={layer.id} beforeId={firstSymbolLayerId} />
              ))}
            </Source>
          )}

          {hoverInfo && (
            <Popup
              longitude={hoverInfo.longitude}
              latitude={hoverInfo.latitude}
              closeButton={false}
              closeOnClick={false}
              offset={40}
              anchor={hoverInfo.latitude > 45 ? 'top' : 'bottom'} // Smart anchor for near-top countries
            >
              <div className="p-3 bg-[#1a1f2b] rounded-md shadow-lg w-[350px] h-[350px] flex items-center justify-center">
                <RadialIndexChart
                  country={{
                    name: hoverInfo.feature.properties?.name,
                    essIndex: hoverInfo.feature.properties?.["ESS Index"],
                    indicators: INDEX_KEYS.reduce((acc, key) => {
                      const val = hoverInfo.feature.properties?.[key];
                      if (typeof val === "number") acc[key] = val;
                      return acc;
                    }, {} as Record<string, number>)
                  }}
                  size={300} // 🆙 Larger chart size now that popup is bigger
                />
              </div>
            </Popup>
          )}
        </MapGL>

        {/* The new legend component is placed here */}
        <MapLegend className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30" />

        {!geoJsonData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <p className="text-white text-2xl">Loading Map Data...</p>
          </div>
        )}
      </div>
    </main >
  );
}