import { format, subDays } from 'date-fns';
import { supabase } from './supabase';
import { DomainStats, ReferrerStats, BrowserStats, OSStats, DeviceStats, CountryStats } from './types';

// Helper function to get date range
export const getDateRange = (days: number = 7) => {
  const end = new Date();
  const start = subDays(end, days);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

// Get unique visitors count by IP for a specific domain
const getUniqueVisitors = async (domain: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('ip')
    .eq('domain', domain)
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`);
  
  if (error || !data) return 0;
  
  // Count unique IPs
  const uniqueIps = new Set(data.map(item => item.ip));
  return uniqueIps.size;
};

// Get domain stats
export const getDomainStats = async (startDate: string, endDate: string): Promise<DomainStats[]> => {
  // First get all page views in the date range
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('domain')
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`);
  
  if (error || !data || data.length === 0) return [];

  // Count domains
  const domainCounts: Record<string, number> = {};
  data.forEach(item => {
    if (!domainCounts[item.domain]) {
      domainCounts[item.domain] = 0;
    }
    domainCounts[item.domain]++;
  });
  
  // Calculate total views
  const totalViews = data.length;

  // Get unique visitors for each domain
  const domainsWithVisitors = await Promise.all(
    Object.entries(domainCounts).map(async ([domain, views]) => {
      const visitors = await getUniqueVisitors(domain, startDate, endDate);
      return {
        domain,
        views,
        visitors,
        percentage: Math.round((views / totalViews) * 1000) / 10,
      };
    })
  );

  return domainsWithVisitors.sort((a, b) => b.views - a.views);
};

// Get referrer stats
export const getReferrerStats = async (startDate: string, endDate: string): Promise<ReferrerStats[]> => {
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('referrer, ip')
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`)
    .not('referrer', 'is', null);
  
  if (error || !data || data.length === 0) return [];
  
  // Count referrers and track unique visitors
  const referrerStats: Record<string, { views: number, visitors: Set<string> }> = {};
  
  data.forEach(item => {
    if (!referrerStats[item.referrer]) {
      referrerStats[item.referrer] = { views: 0, visitors: new Set() };
    }
    referrerStats[item.referrer].views++;
    referrerStats[item.referrer].visitors.add(item.ip);
  });
  
  // Calculate total views
  const totalViews = data.length;
  
  // Format the results
  const results: ReferrerStats[] = Object.entries(referrerStats).map(([referrer, stats]) => ({
    referrer,
    views: stats.views,
    visitors: stats.visitors.size,
    percentage: Math.round((stats.views / totalViews) * 1000) / 10,
  }));

  return results.sort((a, b) => b.views - a.views);
};

// Helper function to parse User Agent
const parseUserAgent = (userAgent: string) => {
  const browser = userAgent.match(/(chrome|safari|firefox|edge|opera|msie|trident)/i)?.[0]?.toLowerCase() || 'other';
  const isWebview = userAgent.includes('WebView') || userAgent.includes('wv');
  
  let os = 'other';
  if (userAgent.includes('Windows')) {
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
    else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else os = 'Windows';
  } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux') && !userAgent.includes('Android')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  } else if (userAgent.includes('Chrome OS')) {
    os = 'ChromeOS';
  }
  
  let device = 'Desktop';
  if (userAgent.includes('Mobile')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet';
  } else if (userAgent.includes('TV')) {
    device = 'TV';
  }
  
  return {
    browser: isWebview ? `${browser} (webview)` : browser,
    os,
    device
  };
};

// Get browser stats
export const getBrowserStats = async (startDate: string, endDate: string): Promise<BrowserStats[]> => {
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('user_agent, ip')
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`)
    .not('user_agent', 'is', null);
  
  if (error || !data || data.length === 0) return [];
  
  const browsers: Record<string, { views: number, ips: Set<string> }> = {};
  
  data.forEach(item => {
    const { browser } = parseUserAgent(item.user_agent);
    
    if (!browsers[browser]) {
      browsers[browser] = { views: 0, ips: new Set() };
    }
    
    browsers[browser].views++;
    browsers[browser].ips.add(item.ip);
  });
  
  const totalViews = data.length;
  
  const browserStats = Object.entries(browsers).map(([browser, stats]) => ({
    browser,
    views: stats.views,
    visitors: stats.ips.size,
    percentage: Math.round((stats.views / totalViews) * 1000) / 10,
  }));
  
  return browserStats.sort((a, b) => b.views - a.views);
};

// Get OS stats
export const getOSStats = async (startDate: string, endDate: string): Promise<OSStats[]> => {
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('user_agent, ip')
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`)
    .not('user_agent', 'is', null);
  
  if (error || !data || data.length === 0) return [];
  
  const operatingSystems: Record<string, { views: number, ips: Set<string> }> = {};
  
  data.forEach(item => {
    const { os } = parseUserAgent(item.user_agent);
    
    if (!operatingSystems[os]) {
      operatingSystems[os] = { views: 0, ips: new Set() };
    }
    
    operatingSystems[os].views++;
    operatingSystems[os].ips.add(item.ip);
  });
  
  const totalViews = data.length;
  
  const osStats = Object.entries(operatingSystems).map(([os, stats]) => ({
    os,
    views: stats.views,
    visitors: stats.ips.size,
    percentage: Math.round((stats.views / totalViews) * 1000) / 10,
  }));
  
  return osStats.sort((a, b) => b.views - a.views);
};

// Get device stats
export const getDeviceStats = async (startDate: string, endDate: string): Promise<DeviceStats[]> => {
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('user_agent, ip')
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`)
    .not('user_agent', 'is', null);
  
  if (error || !data || data.length === 0) return [];
  
  const devices: Record<string, { views: number, ips: Set<string> }> = {};
  
  data.forEach(item => {
    const { device } = parseUserAgent(item.user_agent);
    
    if (!devices[device]) {
      devices[device] = { views: 0, ips: new Set() };
    }
    
    devices[device].views++;
    devices[device].ips.add(item.ip);
  });
  
  const totalViews = data.length;
  
  const deviceStats = Object.entries(devices).map(([device, stats]) => ({
    device,
    views: stats.views,
    visitors: stats.ips.size,
    percentage: Math.round((stats.views / totalViews) * 1000) / 10,
  }));
  
  return deviceStats.sort((a, b) => b.views - a.views);
};

// Get country stats
export const getCountryStats = async (startDate: string, endDate: string): Promise<CountryStats[]> => {
  const { data, error } = await supabase
    .from('metrics_page_views')
    .select('country, ip')
    .gte('timestamp', `${startDate}T00:00:00Z`)
    .lte('timestamp', `${endDate}T23:59:59Z`)
    .not('country', 'is', null);
  
  if (error || !data || data.length === 0) return [];
  
  const countries: Record<string, { views: number, ips: Set<string> }> = {};
  
  data.forEach(item => {
    if (!countries[item.country]) {
      countries[item.country] = { views: 0, ips: new Set() };
    }
    
    countries[item.country].views++;
    countries[item.country].ips.add(item.ip);
  });
  
  const totalViews = data.length;
  
  const countryStats = Object.entries(countries).map(([country, stats]) => ({
    country,
    views: stats.views,
    visitors: stats.ips.size,
    percentage: Math.round((stats.views / totalViews) * 1000) / 10,
  }));
  
  return countryStats.sort((a, b) => b.views - a.views);
}; 