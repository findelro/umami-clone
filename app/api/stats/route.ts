import { NextRequest, NextResponse } from 'next/server';
import {
  getDomainStats,
  getReferrerStats,
  getBrowserStats,
  getOSStats,
  getDeviceStats,
  getCountryStats
} from '@/lib/metrics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Get the requested stat type
    const statsType = searchParams.get('type');
    
    if (!statsType) {
      return NextResponse.json(
        { error: 'stat type is required' },
        { status: 400 }
      );
    }

    let data;
    
    // Call the appropriate function based on the requested stat type
    switch (statsType) {
      case 'domains':
        data = await getDomainStats(startDate, endDate);
        break;
      case 'referrers':
        data = await getReferrerStats(startDate, endDate);
        break;
      case 'browsers':
        data = await getBrowserStats(startDate, endDate);
        break;
      case 'os':
        data = await getOSStats(startDate, endDate);
        break;
      case 'devices':
        data = await getDeviceStats(startDate, endDate);
        break;
      case 'countries':
        data = await getCountryStats(startDate, endDate);
        break;
      case 'all':
        // Fetch all stats in parallel
        const [domains, referrers, browsers, os, devices, countries] = await Promise.all([
          getDomainStats(startDate, endDate),
          getReferrerStats(startDate, endDate),
          getBrowserStats(startDate, endDate),
          getOSStats(startDate, endDate),
          getDeviceStats(startDate, endDate),
          getCountryStats(startDate, endDate)
        ]);
        
        data = {
          domains,
          referrers,
          browsers,
          os,
          devices,
          countries
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid stat type. Must be one of: domains, referrers, browsers, os, devices, countries, all' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching data' },
      { status: 500 }
    );
  }
} 