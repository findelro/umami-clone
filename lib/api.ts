import { supabase } from './supabase';
import { format } from 'date-fns';

export interface DashboardOptions {
  domains?: string[];
  excludeSelfReferrals?: boolean;
  groupReferrersByDomain?: boolean;
  minViews?: number;
  maxResultsPerSection?: number;
}

// Format the date for the Supabase API call
const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
};

// Function to get all dashboard data in a single call
export const getDashboardData = async (
  startDate: Date,
  endDate: Date,
  options: DashboardOptions = {}
) => {
  const { data, error } = await supabase.rpc('get_dashboard_data', {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    domains: options.domains || null,
    exclude_self_referrals: options.excludeSelfReferrals ?? true,
    group_referrers_by_domain: options.groupReferrersByDomain ?? true,
    min_views: options.minViews ?? 1,
    max_results_per_section: options.maxResultsPerSection ?? 50
  });
  
  if (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      domains: [],
      referrers: [],
      browsers: [],
      os: [],
      devices: [],
      countries: []
    };
  }
  
  return data || {
    domains: [],
    referrers: [],
    browsers: [],
    os: [],
    devices: [],
    countries: []
  };
};

// Individual API functions for specific data if needed
export const getExternalReferrers = async (
  startDate: Date,
  endDate: Date,
  domains?: string[]
) => {
  const { data, error } = await supabase.rpc('get_external_referrers', {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    domains: domains || null
  });
  
  if (error) {
    console.error('Error fetching referrers:', error);
    return [];
  }
  
  return data || [];
};

export const getFilteredReferrers = async (
  startDate: Date,
  endDate: Date,
  options: {
    domains?: string[];
    excludeSelfReferrals?: boolean;
    groupByDomain?: boolean;
    minViews?: number;
    maxResults?: number;
  } = {}
) => {
  const { data, error } = await supabase.rpc('get_filtered_referrers', {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    domains: options.domains || null,
    exclude_self_referrals: options.excludeSelfReferrals ?? true,
    group_by_domain: options.groupByDomain ?? false,
    min_views: options.minViews ?? 1,
    max_results: options.maxResults ?? 100
  });
  
  if (error) {
    console.error('Error fetching filtered referrers:', error);
    return [];
  }
  
  return data || [];
};

export const getAnalyticsData = async (
  dataType: 'referrers' | 'browsers' | 'os' | 'devices' | 'countries' | 'domains',
  startDate: Date,
  endDate: Date,
  options: {
    domains?: string[];
    excludeSelfReferrals?: boolean;
    groupByDomain?: boolean;
    minViews?: number;
    maxResults?: number;
  } = {}
) => {
  const { data, error } = await supabase.rpc('get_analytics_data', {
    data_type: dataType,
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    domains: options.domains || null,
    exclude_self_referrals: options.excludeSelfReferrals ?? true,
    group_by_domain: options.groupByDomain ?? false,
    min_views: options.minViews ?? 1,
    max_results: options.maxResults ?? 100
  });
  
  if (error) {
    console.error(`Error fetching ${dataType} data:`, error);
    return [];
  }
  
  return data || [];
}; 