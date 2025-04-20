declare module '@react-jvectormap/core' {
  import React from 'react';

  export interface LabelObject {
    html: (content: string) => void;
  }

  export interface VectorMapProps {
    map: any;
    backgroundColor?: string;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    regionStyle?: {
      initial?: {
        fill?: string;
        "fill-opacity"?: number;
        stroke?: string;
        "stroke-width"?: number;
        "stroke-opacity"?: number;
      };
      hover?: {
        fill?: string;
        "fill-opacity"?: number;
        cursor?: string;
      };
      selected?: {
        fill?: string;
      };
    };
    zoomOnScroll?: boolean;
    zoomButtons?: boolean;
    series?: {
      regions?: Array<{
        values: Record<string, number>;
        scale?: string[];
        normalizeFunction?: 'polynomial' | 'linear';
      }>;
    };
    onRegionTipShow?: (event: Event, label: LabelObject, code: string) => void;
    onRegionClick?: (event: Event, code: string) => void;
    [key: string]: any;
  }

  export const VectorMap: React.FC<VectorMapProps>;
}

declare module '@react-jvectormap/world' {
  export const worldMill: {
    insets: Array<any>;
    paths: Record<string, any>;
    height: number;
    width: number;
  };
} 