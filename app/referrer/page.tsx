'use client';

import { useState, useEffect, Suspense } from 'react';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import DateRangePicker from '@/components/DateRangePicker';
import StatsCard from '@/components/StatsCard';
import Header from '../components/Header';
import { ReferrerTargetStats } from '@/lib/types';

function ReferrerContent() {
  const searchParams = useSearchParams();
  const referrerDomain = searchParams.get('domain');

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd')
  });

  // Include bots state
  const [includeBots, setIncludeBots] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrerData, setReferrerData] = useState<ReferrerTargetStats[]>([]);

  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleIncludeBotsChange = (include: boolean) => {
    setIncludeBots(include);
  };

  // Fetch referrer target data
  useEffect(() => {
    const fetchReferrerData = async () => {
      if (!referrerDomain) {
        setError("No referrer domain specified");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/stats/referrer?referrerDomain=${encodeURIComponent(referrerDomain)}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&includeBots=${includeBots}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        
        const result = await response.json();
        setReferrerData(result.data);
      } catch (err) {
        console.error('Error fetching referrer data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrerData();
  }, [referrerDomain, dateRange.startDate, dateRange.endDate, includeBots]);

  return (
    <>
      <Header title={`Referrer Analysis: ${referrerDomain || 'Unknown'}`} />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Date picker */}
            <div className="flex justify-end items-center">
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onRangeChange={handleDateRangeChange}
                includeBots={includeBots}
                onIncludeBotsChange={handleIncludeBotsChange}
              />
            </div>

            {isLoading ? (
              // Loading state
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              // Error state
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <StatsCard>
                {referrerData.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No data available for this referrer domain in the selected date range
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-100">
                    <thead className="bg-white">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                          Referrer Page
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                          Target Page
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tracking-wider">
                          Visitors
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tracking-wider">
                          Views
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tracking-wider">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {referrerData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate" title={item.referrerPage}>
                            {item.referrerPage}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={item.targetPage}>
                            {item.targetPage}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                            {item.visitors.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {item.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {item.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </StatsCard>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ReferrerDrillDown() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ReferrerContent />
    </Suspense>
  );
} 