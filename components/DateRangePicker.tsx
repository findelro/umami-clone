import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  className = '',
}: DateRangePickerProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRangeChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRangeChange(startDate, e.target.value);
  };

  // Quick date range presets
  const selectLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    
    onRangeChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  const selectLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    onRangeChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  const selectThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    
    onRangeChange(
      start.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );
  };

  return (
    <div className={`flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center ${className}`}>
      <div className="flex items-center space-x-2">
        <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
          From:
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
          To:
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block border-gray-300 rounded-md"
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={selectLast7Days}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={selectLast30Days}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Last 30 days
        </button>
        <button
          type="button"
          onClick={selectThisMonth}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          This month
        </button>
      </div>
    </div>
  );
} 