# Dashboard Analytics Setup

This directory contains the SQL stored procedure for the analytics dashboard.

## SQL Function

The `sql` directory contains a PostgreSQL stored procedure that runs in your Supabase database:

- `get_dashboard_data` - Returns all dashboard analytics data in a single call

## Deploying the Function to Supabase

To deploy the SQL function to your Supabase project:

1. Copy the contents of `setup/sql/get_dashboard_data.sql`
2. Open your Supabase dashboard
3. Go to the SQL Editor
4. Create a new query
5. Paste the SQL code
6. Run the query

This will create the function and grant the necessary permissions for your frontend to access it.

## Using the Function in Your Code

After deploying the function, you can use it in your frontend code. The project includes helper functions in `lib/api.ts` that make it easy to call this stored procedure.

Example usage:

```typescript
import { getDashboardData } from '@/lib/api';

// In your component
const fetchDashboardData = async () => {
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-01-31');
  
  const data = await getDashboardData(startDate, endDate, {
    excludeSelfReferrals: true,
    groupReferrersByDomain: true
  });
  
  // Use the data in your component
  console.log(data);
};
```

## Benefits of Using the Dashboard Data Function

The `get_dashboard_data` function offers several advantages:

1. **Efficiency**: Makes a single database call instead of multiple separate calls
2. **Performance**: Reduces network latency and database load
3. **Consistency**: Ensures all data is filtered with the same criteria
4. **Flexibility**: Offers parameters to customize the data returned
5. **Grouping**: Automatically groups data like referrers, browsers, etc. for cleaner visualization

## Function Parameters

The dashboard function accepts the following parameters:

- `start_date`: Start date for analytics (timestamp with time zone)
- `end_date`: End date for analytics (timestamp with time zone)
- `domains`: Optional array of domains to filter by (text[], default NULL)
- `exclude_self_referrals`: Whether to exclude self-referrals (boolean, default true)
- `group_referrers_by_domain`: Whether to group referrers by domain (boolean, default true)
- `min_views`: Minimum number of views to include a result (integer, default 1)
- `max_results_per_section`: Maximum number of results to return per section (integer, default 50) 