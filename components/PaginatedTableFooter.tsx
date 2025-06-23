import React from 'react';

interface PaginatedTableFooterProps {
  itemsToShow: number;
  totalItems: number;
  initialItemsToShow: number;
  itemsPerLoad: number;
  showAll: boolean;
  onLoadMore: () => void;
  onShowAll: () => void;
  onShowLess: () => void;
}

const PaginatedTableFooter: React.FC<PaginatedTableFooterProps> = ({
  itemsToShow,
  totalItems,
  initialItemsToShow,
  itemsPerLoad,
  showAll,
  onLoadMore,
  onShowAll,
  onShowLess,
}) => {
  const hasMoreData = itemsToShow < totalItems;
  return (
    (hasMoreData || (itemsToShow > initialItemsToShow && !showAll)) && (
      <div className="flex justify-center items-center py-3 space-x-2">
        {hasMoreData && (
          <>
            <button
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
              onClick={onLoadMore}
              aria-label={`Load ${itemsPerLoad} more items`}
            >
              More
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <button
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
              onClick={onShowAll}
              aria-label={`Show all ${totalItems} items`}
            >
              Show All ({totalItems - itemsToShow} remaining)
            </button>
          </>
        )}
        {itemsToShow >= totalItems && totalItems > initialItemsToShow && !showAll && (
          <>
            <button
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
              onClick={onShowLess}
              aria-label={`Show only first ${initialItemsToShow} items`}
            >
              Show Less
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <span className="text-sm text-gray-500">
              Showing all {totalItems} items
            </span>
          </>
        )}
      </div>
    )
  );
};

export default PaginatedTableFooter; 