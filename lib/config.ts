// Application configuration constants
export const APP_CONFIG = {
  // Table pagination settings
  TABLE_PAGINATION: {
    DOMAINS: {
      INITIAL_ITEMS: 15,
      ITEMS_PER_LOAD: 15,
    },
    REFERRERS: {
      INITIAL_ITEMS: 10,
      ITEMS_PER_LOAD: 10,
    },
    BROWSERS: {
      INITIAL_ITEMS: 1000, // Not used - showAllByDefault is true
      ITEMS_PER_LOAD: 1000, // Not used - showAllByDefault is true
    },
    OS: {
      INITIAL_ITEMS: 1000, // Not used - showAllByDefault is true
      ITEMS_PER_LOAD: 1000, // Not used - showAllByDefault is true
    },
    DEVICES: {
      INITIAL_ITEMS: 1000, // Not used - showAllByDefault is true
      ITEMS_PER_LOAD: 1000, // Not used - showAllByDefault is true
    },
    COUNTRIES: {
      INITIAL_ITEMS: 12,
      ITEMS_PER_LOAD: 12,
    },
    DETAIL_HITS: {
      INITIAL_ITEMS: 20,
      ITEMS_PER_LOAD: 100,
    },
  },
  
  // API settings
  API: {
    MAX_RESULTS_PER_SECTION: 200,
    DEFAULT_DATE_RANGE_DAYS: 7,
  },
  
  // UI settings
  UI: {
    LOADING_SPINNER_SIZE: {
      SMALL: 'h-8 w-8',
      MEDIUM: 'h-12 w-12',
    },
    ANIMATION_DURATION: {
      FAST: 'duration-200',
      NORMAL: 'duration-300',
    },
  },
} as const;

// Type for table section names
export type TableSection = keyof typeof APP_CONFIG.TABLE_PAGINATION;

// Helper function to get table config for a section
export function getTableConfig(section: TableSection) {
  return APP_CONFIG.TABLE_PAGINATION[section];
} 