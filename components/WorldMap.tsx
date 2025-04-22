import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { CountryStats } from '@/lib/types';

// Simple world map GeoJSON URL (using a reliable public source)
const WORLD_MAP_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface WorldMapProps {
  data: CountryStats[];
  className?: string;
}

// Define a type for the geography objects
interface GeoFeature {
  rsmKey: string;
  id?: string;
  properties: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
}

export default function WorldMap({ data, className = '' }: WorldMapProps) {
  // Function to determine fill color based on country data
  const getFillColor = (geo: GeoFeature) => {
    const countryCode = geo.properties.id || geo.id;
    const countryData = data.find(item => item.country === countryCode);
    return countryData ? '#2563EB' : '#D1D5DB';
  };

  return (
    <div className={className}>
      <ComposableMap>
        <ZoomableGroup zoom={1}>
          <Geographies geography={WORLD_MAP_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFillColor(geo)}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#1E40AF' },
                    pressed: { outline: 'none' }
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
} 