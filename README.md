# Domain Analytics Dashboard

A Next.js application that displays analytics across multiple domains, similar to Umami but with a focus on comparing domains.

## Features

- Compare analytics across multiple domains
- View referrers, browsers, operating systems, devices, and countries
- Interactive world map visualization
- Date range selection
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- react-simple-maps for interactive maps
- date-fns for date manipulation
- Chart.js and react-chartjs-2 for visualizations

## Getting Started

1. Clone the repository
2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_SERVICE_KEY}
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Database Schema

The application uses the following Supabase/PostgreSQL schema:

```sql
CREATE TABLE public.metrics_page_views (
  id bigserial NOT NULL,
  "timestamp" timestamptz NOT NULL,
  ip text NULL,
  country text NULL,
  city text NULL,
  user_agent text NULL,
  referrer text NULL,
  "domain" text NULL,
  "path" text NULL,
  CONSTRAINT metrics_page_views_pkey PRIMARY KEY (id)
);
```

## Deployment

This project is configured for deployment on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdomain-analytics-dashboard)
