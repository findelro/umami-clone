import React from 'react';

// Simplified StatsData interface that doesn't require an index signature
interface StatsData {
  views: number;
  visitors: number;
  percentage: number;
}

interface StatsTableProps<T extends StatsData> {
  data: T[];
  nameKey: keyof T;
  namePlaceholder?: string;
  className?: string;
  showHeaders?: boolean;
  isCountryTable?: boolean;
}

export default function StatsTable<T extends StatsData>({
  data,
  nameKey,
  namePlaceholder = 'Other',
  className = '',
  showHeaders = true,
  isCountryTable = false,
}: StatsTableProps<T>) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-4">No data available</div>;
  }

  return (
    <div className={`${className}`}>
      <table className="min-w-full divide-y divide-gray-100">
        {showHeaders && (
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900 tracking-wider">
                {isCountryTable ? 'Countries' : String(nameKey).charAt(0).toUpperCase() + String(nameKey).slice(1)}
              </th>
              {!isCountryTable && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIEWS
                </th>
              )}
              <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tracking-wider">
                {isCountryTable ? 'Visitors' : 'VISITORS'}
              </th>
              {!isCountryTable && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item, index) => {
            // Safely convert the key value to string
            const keyValue = String(item[nameKey] || '');
            const displayName = keyValue || namePlaceholder;
            
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {isCountryTable ? (
                    <div className="flex items-center">
                      <span className="mr-2 w-5 text-center">{getCountryFlag(keyValue)}</span>
                      <span>{displayName}</span>
                    </div>
                  ) : (
                    <span>{displayName}</span>
                  )}
                </td>
                {!isCountryTable && (
                  <td className="px-6 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                    {item.views.toLocaleString()}
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  {isCountryTable ? (
                    <div className="relative flex items-center justify-end h-full">
                      <span className="font-semibold text-gray-900 pr-[52px]">
                        {item.visitors.toLocaleString()}
                      </span>
                      <div className="absolute right-[40px] top-1/2 transform -translate-y-1/2 w-px h-5 bg-gray-900"></div>
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                        {/* Container for percentage and bar */}
                        <div className="relative flex items-center">
                          {/* Bar graph extending to the right */}
                          <div className="absolute left-0 w-[120px]">
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 left-0 h-5 bg-blue-50"
                              style={{ 
                                width: `${item.percentage}%`,
                              }}
                            ></div>
                          </div>
                          {/* Percentage text */}
                          <span className="relative z-10 w-[40px] text-center text-gray-900 px-1 py-0.5">
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900 mr-3">{item.visitors.toLocaleString()}</span>
                      <span className="text-gray-900">{item.percentage.toFixed(0)}%</span>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isCountryTable && data.length > 10 && (
        <div className="flex justify-center items-center py-3">
          <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
            More <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🏴'; // Return a default flag or empty string
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
} 