import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { CountryStats } from '@/lib/types';
import FallbackMap from './FallbackMap';

// Use a more reliable source for the world map data
// We'll use a local fallback for the map data rather than relying on an external fetch
const WORLD_MAP_DATA = {
  "type": "Topology",
  "objects": {
    "countries": {
      "type": "GeometryCollection",
      "geometries": [
        // This will be empty since we're using FallbackMap component instead
      ]
    }
  }
};

interface WorldMapProps {
  data: CountryStats[];
  className?: string;
}

interface GeoFeature {
  rsmKey: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export default function WorldMap({ data, className = '' }: WorldMapProps) {
  // Since we're having issues fetching the map data, we'll directly use the FallbackMap
  // No need to attempt fetching the external map data which is causing errors
  
  return (
    <div className={className}>
      <FallbackMap data={data} className="h-full w-full" />
    </div>
  );
} 