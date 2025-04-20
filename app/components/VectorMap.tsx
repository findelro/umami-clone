'use client';

import React, { useEffect, useState } from 'react';
import { VectorMap as ReactVectorMap } from '@react-jvectormap/core';
import { worldMill } from '@react-jvectormap/world';
import { CountryStats } from '@/lib/types';

interface VectorMapProps {
  data: CountryStats[];
  className?: string;
}

export default function VectorMap({ data, className = '' }: VectorMapProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Transform data into the format expected by jVectorMap
  const mapData = data.reduce((acc, { country, visitors }) => {
    return {
      ...acc,
      [country]: visitors,
    };
  }, {});

  // Calculate color scale based on data
  const maxVisitors = data.length > 0 
    ? Math.max(...data.map(item => item.visitors)) 
    : 0;

  if (!isClient) {
    return <div className={`${className} bg-gray-100 animate-pulse rounded-lg`} />;
  }

  return (
    <div className={className}>
      <ReactVectorMap
        map={worldMill}
        backgroundColor="transparent"
        zoomOnScroll={false}
        containerStyle={{
          width: '100%',
          height: '100%',
        }}
        regionStyle={{
          initial: {
            fill: '#e6f0fd',
            fillOpacity: 1,
            stroke: '#fff',
            strokeWidth: 1,
            strokeOpacity: 1,
          },
          hover: {
            fillOpacity: 0.8,
            cursor: 'pointer',
          },
          selected: {
            fill: '#4F46E5',
          },
          selectedHover: {},
        }}
        series={{
          regions: [
            {
              values: mapData,
              scale: ['#e6f0fd', '#4F46E5'],
              normalizeFunction: 'polynomial',
              attribute: 'fill',
            },
          ],
        }}
        onRegionTipShow={(e, el, code) => {
          const countryData = data.find(item => item.country === code);
          if (countryData && el) {
            const element = el as any;
            const currentContent = element.html ? element.html() : '';
            element.html && element.html(
              `<div class="tooltip-inner">
                <b>${currentContent}</b><br />
                ${countryData.visitors.toLocaleString()} visitors
              </div>`
            );
          }
        }}
      />
    </div>
  );
} 