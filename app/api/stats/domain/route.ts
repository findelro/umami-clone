import { NextRequest, NextResponse } from 'next/server';
import { getDomainHits } from '@/lib/metrics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const domain = searchParams.get('domain');
    
    if (!startDate || !endDate || !domain) {
      return NextResponse.json(
        { error: 'startDate, endDate, and domain are required' },
        { status: 400 }
      );
    }

    const data = await getDomainHits(domain, startDate, endDate);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching domain data' },
      { status: 500 }
    );
  }
}