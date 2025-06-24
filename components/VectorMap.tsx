import React from 'react';
import dynamic from 'next/dynamic';
import { CountryStats } from '@/lib/types';
import { getCountryName } from '@/lib/countries';

const formatVisitors = (visitors: number) => {
  if (visitors >= 1000) {
    return `${(visitors / 1000).toFixed(2)}k`;
  }
  return visitors.toLocaleString();
};

// Dynamically import the VectorMap component to avoid SSR issues
const VectorMapNoSSR = dynamic(
  async () => {
    const { VectorMap } = await import('@react-jvectormap/core');
    const { worldMill } = await import('@react-jvectormap/world');
    
    // Define proper props type
    interface JVectorMapProps {
      backgroundColor?: string;
      containerStyle?: React.CSSProperties;
      containerClassName?: string;
      regionStyle?: Record<string, unknown>;
      zoomOnScroll?: boolean;
      zoomButtons?: boolean;
      series?: Record<string, unknown>;
      onRegionTipShow?: (event: Event, label: LabelObject, code: string) => void;
    }
    
    return function JVectorMap(props: JVectorMapProps) {
      return (
        <VectorMap
          {...props}
          map={worldMill}
        />
      );
    };
  },
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ) 
  }
);

// No need for country code mapping, as jVectorMap uses ISO 3166-1 alpha-2 codes by default
// const countryCodeMapping: Record<string, string> = { ... };

interface VectorMapProps {
  data: CountryStats[];
  className?: string;
}

// Type definitions for jVectorMap event handlers
interface LabelObject {
  html: (content: string) => void;
}

export default function InteractiveVectorMap({ data, className = '' }: VectorMapProps) {
  // Convert country data to format needed by jVectorMap
  const countryData: Record<string, number> = {};
  const countryNames: Record<string, string> = {};
  const countryPercentages: Record<string, number> = {};

  const totalVisitors = data.reduce((sum, country) => sum + country.visitors, 0);

  data.forEach(country => {
    // jVectorMap uses 2-letter ISO codes, which are already in the data
    const countryCode = country.country;
    countryData[countryCode] = country.visitors;
    countryNames[countryCode] = getCountryName(country.country);
    if (totalVisitors > 0) {
      countryPercentages[countryCode] = (country.visitors / totalVisitors) * 100;
    } else {
      countryPercentages[countryCode] = 0;
    }
  });

  return (
    <div className={`${className}`}>
      <VectorMapNoSSR
        backgroundColor="transparent"
        containerStyle={{
          width: '100%',
          height: '100%'
        }}
        containerClassName="map"
        regionStyle={{
          initial: {
            fill: '#e9ecef',
            "fill-opacity": 1,
            stroke: 'white',
            "stroke-width": 0.25,
            "stroke-opacity": 1
          },
          hover: {
            fill: '#93C5FD',
            "fill-opacity": 0.8,
            cursor: 'pointer'
          }
        }}
        zoomOnScroll={false}
        zoomButtons={false}
        series={{
          regions: [
            {
              values: countryData,
              scale: ['#cfe2ff', '#4285f4'],
              normalizeFunction: 'polynomial'
            }
          ]
        }}
        onRegionTipShow={(event: Event, label: LabelObject, code: string) => {
          const countryName = getCountryName(code);
          const visitors = countryData[code] || 0;

          if (visitors > 0) {
            const formattedVisitors = formatVisitors(visitors);
            label.html(
              `<div><strong>${countryName}:</strong> ${formattedVisitors} visitor${visitors !== 1 ? 's' : ''}</div>`
            );
          } else {
            // Prevents showing a tooltip for countries with no data
            (event.target as HTMLElement).setAttribute('data-tip-show', 'false');
          }
        }}
      />
    </div>
  );
} 