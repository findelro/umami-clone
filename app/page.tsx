'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DateRangePicker from '@/components/DateRangePicker';
import StatsCard from '@/components/StatsCard';
import TableWithPercentage from '@/components/TableWithPercentage';
import Header from './components/Header';
import dynamic from 'next/dynamic';
import { 
  DomainStats, 
  ReferrerStats, 
  BrowserStats, 
  OSStats, 
  DeviceStats, 
  CountryStats 
} from '@/lib/types';
import { APP_CONFIG } from '@/lib/config';

// Dynamically import the VectorMap component with no SSR to prevent hydration errors
const InteractiveVectorMap = dynamic(() => import('@/components/VectorMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function Home() {
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - APP_CONFIG.API.DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Stats data state
  const [domainsData, setDomainsData] = useState<DomainStats[]>([]);
  const [referrersData, setReferrersData] = useState<ReferrerStats[]>([]);
  const [browsersData, setBrowsersData] = useState<BrowserStats[]>([]);
  const [osData, setOsData] = useState<OSStats[]>([]);
  const [devicesData, setDevicesData] = useState<DeviceStats[]>([]);
  const [countriesData, setCountriesData] = useState<CountryStats[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  // Fetch all stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all stats from the API
        const response = await fetch(
          `/api/stats?type=all&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&maxResults=${APP_CONFIG.API.MAX_RESULTS_PER_SECTION}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        
        const result = await response.json();
        const dashboardData = result.data;
        
        // Update state with the fetched data
        // Note: The domain structure is the same, but other data types don't have domain property anymore
        setDomainsData(dashboardData.domains);
        
        // Map the data to match the expected structure if necessary
        const mappedReferrers = dashboardData.referrers.map((item: Omit<ReferrerStats, 'domain'>) => ({
          ...item,
          domain: '' 
        }));
        
        const mappedBrowsers = dashboardData.browsers.map((item: Omit<BrowserStats, 'domain'>) => ({
          ...item,
          domain: '' 
        }));
        
        const mappedOs = dashboardData.os.map((item: Omit<OSStats, 'domain'>) => ({
          ...item,
          domain: '' 
        }));
        
        const mappedDevices = dashboardData.devices.map((item: Omit<DeviceStats, 'domain'>) => ({
          ...item,
          domain: '' 
        }));
        
        const mappedCountries = dashboardData.countries.map((item: Omit<CountryStats, 'domain'>) => ({
          ...item,
          domain: '' 
        }));
        
        setReferrersData(mappedReferrers);
        setBrowsersData(mappedBrowsers);
        setOsData(mappedOs);
        setDevicesData(mappedDevices);
        setCountriesData(mappedCountries);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [dateRange.startDate, dateRange.endDate]);

  return (
    <>
      <Header title="Domain Analytics Dashboard" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Date Range Picker */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onRangeChange={handleDateRangeChange}
              />
            </div>

            {isLoading ? (
              // Loading state
              <div className="flex items-center justify-center py-12">
                <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${APP_CONFIG.UI.LOADING_SPINNER_SIZE.MEDIUM}`}></div>
              </div>
            ) : error ? (
              // Error state
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <>
                {/* Domains and Referrers Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Domains Stats */}
                  <StatsCard>
                    <TableWithPercentage 
                      data={domainsData} 
                      title="Domains"
                      nameKey="domain"
                      initialItemsToShow={APP_CONFIG.TABLE_PAGINATION.DOMAINS.INITIAL_ITEMS}
                      itemsPerLoad={APP_CONFIG.TABLE_PAGINATION.DOMAINS.ITEMS_PER_LOAD}
                    />
                  </StatsCard>

                  {/* Referrers Stats */}
                  <StatsCard>
                    <TableWithPercentage 
                      data={referrersData} 
                      title="Referrers"
                      nameKey="referrer"
                      namePlaceholder="Direct / None"
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      initialItemsToShow={APP_CONFIG.TABLE_PAGINATION.REFERRERS.INITIAL_ITEMS}
                      itemsPerLoad={APP_CONFIG.TABLE_PAGINATION.REFERRERS.ITEMS_PER_LOAD}
                    />
                  </StatsCard>
                </div>

                {/* Stats Tables Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Browsers Stats */}
                  <StatsCard>
                    <TableWithPercentage 
                      data={browsersData} 
                      title="Browsers"
                      nameKey="browser"
                      showAllByDefault={true}
                    />
                  </StatsCard>

                  {/* OS Stats */}
                  <StatsCard>
                    <TableWithPercentage 
                      data={osData} 
                      title="OS"
                      nameKey="os"
                      showAllByDefault={true}
                    />
                  </StatsCard>

                  {/* Devices Stats */}
                  <StatsCard>
                    <TableWithPercentage 
                      data={devicesData} 
                      title="Devices"
                      nameKey="device"
                      showAllByDefault={true}
                    />
                  </StatsCard>
                </div>

                {/* World Map and Countries side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Map Visualization */}
                  <StatsCard title="Visitor Locations" className="lg:col-span-3">
                    <div className="h-96">
                      <InteractiveVectorMap data={countriesData} className="h-full w-full" />
                    </div>
                  </StatsCard>

                  {/* Countries Stats */}
                  <StatsCard className="lg:col-span-2">
                    <div className="h-96 overflow-auto">
                      <TableWithPercentage 
                        data={countriesData} 
                        title="Countries"
                        nameKey="country"
                        showFlags={true}
                        initialItemsToShow={APP_CONFIG.TABLE_PAGINATION.COUNTRIES.INITIAL_ITEMS}
                        itemsPerLoad={APP_CONFIG.TABLE_PAGINATION.COUNTRIES.ITEMS_PER_LOAD}
                      />
                    </div>
                  </StatsCard>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
