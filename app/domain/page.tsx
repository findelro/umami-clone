'use client';

import { useState, useEffect, Suspense } from 'react';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import DateRangePicker from '@/components/DateRangePicker';
import StatsCard from '@/components/StatsCard';
import Header from '../components/Header';
import { DomainHit } from '@/lib/types';

function DomainContent() {
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd')
  });

  // Data state
  const [hits, setHits] = useState<DomainHit[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  // Fetch domain hits
  useEffect(() => {
    const fetchDomainHits = async () => {
      if (!domain) {
        setError("No domain specified");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/stats/domain?domain=${encodeURIComponent(domain)}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        
        const result = await response.json();
        setHits(result.data);
      } catch (err) {
        console.error('Error fetching domain hits:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainHits();
  }, [domain, dateRange.startDate, dateRange.endDate]);

  return (
    <>
      <Header title={`Domain Analysis: ${domain || 'Unknown'}`} />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Date picker */}
            <div className="flex justify-end items-center">
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onRangeChange={handleDateRangeChange}
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
              // Data display
              <StatsCard>
                {hits.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No hits found for this domain in the selected date range
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-100">
                    <thead className="bg-white">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                          Page
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                          Referrer
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                          IP
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {hits.map((hit, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate" title={hit.page}>
                            {hit.page}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={hit.referrer || ''}>
                            {hit.referrer || ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                            {hit.ip}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {format(new Date(hit.timestamp), 'MMM dd, yyyy HH:mm:ss')}
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

export default function DomainAnalysis() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <DomainContent />
    </Suspense>
  );
} 