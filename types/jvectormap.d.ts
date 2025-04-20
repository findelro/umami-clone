declare module '@react-jvectormap/core' {
  import React from 'react';

  export interface IVectorMapProps {
    map: any;
    backgroundColor?: string;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    regionStyle?: {
      initial?: Record<string, any>;
      hover?: Record<string, any>;
      selected?: Record<string, any>;
      [key: string]: any;
    };
    zoomOnScroll?: boolean;
    zoomButtons?: boolean;
    series?: {
      regions?: Array<{
        values: Record<string, number>;
        scale: string[];
        normalizeFunction?: string;
        attribute?: string;
      }>;
      [key: string]: any;
    };
    onRegionTipShow?: (event: Event, label: any, code: string) => void;
    [key: string]: any;
  }

  export class VectorMap extends React.Component<IVectorMapProps> {}
}

declare module '@react-jvectormap/world' {
  const worldMill: any;
  export { worldMill };
} 