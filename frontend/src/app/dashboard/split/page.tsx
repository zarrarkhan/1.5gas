"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import MapGL, { Source, Layer, Popup, MapMouseEvent } from "react-map-gl/mapbox";
import type { AnyLayer } from "mapbox-gl";
import type { FeatureCollection, Feature } from "geojson";
import 'mapbox-gl/dist/mapbox-gl.css';
import { LEGEND_COLORS, INDEX_KEYS } from "@/lib/colors";
import { parseCSV } from "@/lib/parseCSV";
import { useViewportHeight } from "@/lib/useViewportHeight";
import Navbar from "@/components/Navbar";
import Link from 'next/link';
import MapLegend from "@/components/MapLegend";
import RadialIndexChart from "@/components/RadialIndexChart";

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const getDataLayerStyle = (indexKey: string): AnyLayer => ({
    id: `countries-data`,
    type: 'fill',
    source: 'countries-data',
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

const getHighlightLayers = (iso: string, suffix: string): AnyLayer[] => {
    const filter = ['==', ['get', 'ISO3166-1-Alpha-3'], iso];

    return [
        {
            id: `highlight-casing-${suffix}`,
            type: 'line',
            source: 'countries-data',
            filter,
            paint: {
                'line-color': '#ffffff',
                'line-width': 4,
                'line-blur': 2
            }
        },
        {
            id: `highlight-inline-${suffix}`,
            type: 'line',
            source: 'countries-data',
            filter,
            paint: {
                'line-color': '#004C80',
                'line-width': 2
            }
        }
    ];
};

type GlobeProps = {
    indexKey: string;
    setIndexKey: (val: string) => void;
    geoJsonData: FeatureCollection;
    viewState: any;
    setViewState: (val: any) => void;
    hoveredISO: string | null;
    setHoveredISO: (iso: string | null) => void;
    globeId: string;
};

function Globe({
    indexKey,
    setIndexKey,
    geoJsonData,
    viewState,
    setViewState,
    hoveredISO,
    setHoveredISO,
    globeId
}: GlobeProps) {
    const [hoverInfo, setHoverInfo] = useState<{
        longitude: number;
        latitude: number;
        feature: Feature;
    } | null>(null);

    const onHover = (event: MapMouseEvent) => {
        const { features, lngLat } = event;
        const hoveredFeature = features && features[0];

        if (hoveredFeature) {
            const iso = hoveredFeature.properties?.['ISO3166-1-Alpha-3'];
            setHoveredISO(iso);
            setHoverInfo({
                longitude: lngLat.lng,
                latitude: lngLat.lat,
                feature: hoveredFeature
            });
        } else {
            setHoveredISO(null);
            setHoverInfo(null);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <select
                value={indexKey}
                onChange={(e) => setIndexKey(e.target.value)}
                className="bg-gray-800 text-white px-3 py-1 rounded"
            >
                {INDEX_KEYS.map(key => (
                    <option key={key} value={key}>{key}</option>
                ))}
            </select>

            <div className="w-full aspect-square relative">
                <MapGL
                    {...viewState}
                    onMove={(e) => setViewState(e.viewState)}
                    onMouseMove={onHover}
                    onLoad={(event) => {
                        const map = event.target;
                        const layers = map.getStyle().layers;

                        const rootStyle = getComputedStyle(document.documentElement);
                        const haloColor = rootStyle.getPropertyValue('--color-text-base').trim() || '#1A202C';

                        layers?.forEach((layer) => {
                            if (layer.type === 'symbol' && map.getLayer(layer.id)) {
                                map.setPaintProperty(layer.id, 'text-color', '#FFFFFF');
                                map.setPaintProperty(layer.id, 'text-opacity', 1);
                                map.setPaintProperty(layer.id, 'text-halo-color', haloColor);
                                map.setPaintProperty(layer.id, 'text-halo-width', 1);
                                map.setPaintProperty(layer.id, 'text-halo-blur', 0);
                            }
                        });
                    }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    projection={{ name: "globe" }}
                    interactiveLayerIds={['countries-data']}
                >
                    <Source type="geojson" data={geoJsonData}>
                        <Layer {...getDataLayerStyle(indexKey)} />
                        {hoveredISO &&
                            getHighlightLayers(hoveredISO, globeId).map(layer => (
                                <Layer {...layer} key={layer.id} />
                            ))}
                    </Source>

                    {hoverInfo && (
                        <Popup
                            longitude={hoverInfo.longitude}
                            latitude={hoverInfo.latitude}
                            closeButton={false}
                            closeOnClick={false}
                            offset={20}
                            anchor={hoverInfo.latitude > 45 ? 'top' : 'bottom'}
                        >
                            <div className="p-2 bg-[#1a1f2b] rounded-md shadow-md w-[250px]">
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
                                    size={200}
                                />
                            </div>
                        </Popup>
                    )}
                </MapGL>
            </div>
        </div>
    );
}

export default function SplitGlobesDashboard() {
    useViewportHeight();
    const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);

    const [index1, setIndex1] = useState("1. Risk");
    const [index2, setIndex2] = useState("4. Health");
    const [index3, setIndex3] = useState("7. Inclusion");

    const [hoveredISO, setHoveredISO] = useState<string | null>(null);

    const [viewState, setViewState] = useState({
        longitude: 30,
        latitude: 0,
        zoom: 1.5,
        bearing: 0,
        pitch: 0
    });

    const hasUserInteracted = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!hasUserInteracted.current) {
                setViewState(prev => ({
                    ...prev,
                    longitude: (prev.longitude + 0.2) % 360
                }));
            }
        }, 30);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handle = () => {
            hasUserInteracted.current = true;
        };
        window.addEventListener("mousedown", handle);
        return () => window.removeEventListener("mousedown", handle);
    }, []);

    const fetchData = useCallback(async () => {
        const [geoJsonResponse, csvResponse] = await Promise.all([
            fetch(GEOJSON_URL),
            fetch("/essindex2025_all.csv"),
        ]);

        const geoJson = await geoJsonResponse.json();
        const csvText = await csvResponse.text();
        const essData = parseCSV(csvText);

        const enrichedFeatures = geoJson.features.map((feature: Feature) => {
            const countryISO = feature.properties?.["ISO3166-1-Alpha-3"];
            const countryData = essData.get(countryISO);

            if (countryData) {
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        ...countryData.indicators,
                        name: countryData.name,
                        iso: countryData.iso,
                        "ESS Index": countryData.essIndex
                    }
                };
            }

            return feature;
        });

        setGeoJsonData({ ...geoJson, features: enrichedFeatures });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <main className="bg-black text-white min-h-screen">
            <Navbar />
            <div className="px-6 pt-20">
                <div className="flex justify-center mb-6">
                    <Link href="/dashboard">
                        <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
                            ← Back to Main Dashboard
                        </button>
                    </Link>
                </div>

                {geoJsonData ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <Globe {...{ indexKey: index1, setIndexKey: setIndex1, geoJsonData, viewState, setViewState, hoveredISO, setHoveredISO, globeId: "1" }} />
                            <Globe {...{ indexKey: index2, setIndexKey: setIndex2, geoJsonData, viewState, setViewState, hoveredISO, setHoveredISO, globeId: "2" }} />
                            <Globe {...{ indexKey: index3, setIndexKey: setIndex3, geoJsonData, viewState, setViewState, hoveredISO, setHoveredISO, globeId: "3" }} />
                        </div>

                        <div className="relative -mt-10">
                            <MapLegend className="mx-auto" />
                        </div>
                    </>
                ) : (
                    <div className="h-screen flex items-center justify-center text-2xl">
                        Loading map data...
                    </div>
                )}
            </div>
        </main>
    );
}
