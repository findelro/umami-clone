declare module 'react-simple-maps' {
  import React from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      [key: string]: any;
    };
    width?: number;
    height?: number;
    [key: string]: any;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    [key: string]: any;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: any[] }) => React.ReactNode;
    [key: string]: any;
  }

  export interface GeographyProps {
    geography: any;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    [key: string]: any;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
} 