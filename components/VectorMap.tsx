import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CountryStats } from '@/lib/types';

// Dynamically import the VectorMap component to avoid SSR issues
const VectorMapNoSSR = dynamic(
  async () => {
    const { VectorMap } = await import('@react-jvectormap/core');
    const { worldMill } = await import('@react-jvectormap/world');
    
    return function JVectorMap(props: any) {
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

// ISO 3166-1 alpha-2 country codes to alpha-3 mapping for jVectorMap
const countryCodeMapping: Record<string, string> = {
  'US': 'USA', 'GB': 'GBR', 'CA': 'CAN', 'CN': 'CHN', 'JP': 'JPN', 'AU': 'AUS',
  'DE': 'DEU', 'FR': 'FRA', 'IT': 'ITA', 'ES': 'ESP', 'RU': 'RUS', 'BR': 'BRA',
  'IN': 'IND', 'KR': 'KOR', 'MX': 'MEX', 'ZA': 'ZAF', 'NL': 'NLD', 'SE': 'SWE',
  'CH': 'CHE', 'NO': 'NOR', 'DK': 'DNK', 'PL': 'POL', 'BE': 'BEL', 'AT': 'AUT',
  'FI': 'FIN', 'NZ': 'NZL', 'SG': 'SGP', 'IE': 'IRL', 'AR': 'ARG', 'TH': 'THA',
  'ID': 'IDN', 'MY': 'MYS', 'PH': 'PHL', 'VN': 'VNM', 'TR': 'TUR', 'UA': 'UKR',
  'PT': 'PRT', 'GR': 'GRC', 'HU': 'HUN', 'CZ': 'CZE', 'RO': 'ROU', 'IL': 'ISR',
  'AE': 'ARE', 'SA': 'SAU', 'EG': 'EGY', 'MA': 'MAR', 'KE': 'KEN', 'NG': 'NGA',
  'CL': 'CHL', 'CO': 'COL', 'PE': 'PER', 'VE': 'VEN', 'BD': 'BGD', 'PK': 'PAK'
};

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

  data.forEach(country => {
    // Convert 2-letter codes to 3-letter codes if available
    const countryCode = countryCodeMapping[country.country] || country.country;
    countryData[countryCode] = country.visitors;
    countryNames[countryCode] = country.country;
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
        onRegionTipShow={(_: Event, label: LabelObject, code: string) => {
          const countryName = countryNames[code] || code;
          const visitors = countryData[code] || 0;
          const percent = data.length > 0 
            ? Math.round((visitors / data.reduce((sum, c) => sum + c.visitors, 0)) * 1000) / 10 
            : 0;
            
          label.html(`
            <div class="bg-white py-1 px-2 shadow-sm rounded border border-gray-100">
              <div class="font-medium">${countryName}</div>
              <div class="text-xs text-gray-500">${visitors} visitor${visitors !== 1 ? 's' : ''} (${percent}%)</div>
            </div>
          `);
        }}
      />
    </div>
  );
} 