declare module './components/WasteCompositionChart' {
  import React from 'react';
  interface WasteCompositionChartProps {
    composition: Record<string, number>;
  }
  const WasteCompositionChart: React.FC<WasteCompositionChartProps>;
  export default WasteCompositionChart;
}

declare module './components/WasteDisposalMethods' {
  import React from 'react';
  interface WasteDisposalMethodsProps {
    items: string[];
    methods: Record<string, string>;
  }
  const WasteDisposalMethods: React.FC<WasteDisposalMethodsProps>;
  export default WasteDisposalMethods;
}

declare module './components/QuickStats' {
  import React from 'react';
  interface QuickStatsProps {
    stats: {
      totalItems: number;
      biodegradableItems: number;
      nonBiodegradableItems: number;
      biodegradableRate: string;
    };
  }
  const QuickStats: React.FC<QuickStatsProps>;
  export default QuickStats;
} 