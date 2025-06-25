import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

// Create Supabase client with a 30-second statement timeout
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      // Set PostgreSQL statement_timeout to 30 seconds (30000ms)
      'x-statement-timeout': '30000',
    },
  },
}); 