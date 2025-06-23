# Python Scripts for Analytics Data Processing

This directory contains Python scripts for processing and normalizing analytics data in the Supabase database.

## Scripts Overview

### `populate_normalized_stats.py`
Normalizes user agent strings and referrers in the database by:
- Parsing user agent strings into browser, OS, and device components
- Filtering out bot traffic using configurable signatures
- Normalizing referrer domains
- Handling incomplete/malformed user agent strings

**⚠️ Important: This script must be run from the server due to IPv6-only support by Supabase.**

### `populate_ip_geolocation.py`
Updates missing country and city information for IP addresses using GeoIP databases.

### `populate_normalized_stats.json`
Configuration file containing bot signatures for filtering automated traffic.

## Setup

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_PSQL_DB_HOST=your_host
   SUPABASE_PSQL_DB_NAME=your_db_name
   SUPABASE_PSQL_DB_USER=your_user
   SUPABASE_PSQL_DB_PASSWORD=your_password
   ```

## Usage

### Normalize User Agent Data
```bash
# Run with default settings
python populate_normalized_stats.py

# Run with custom options
python populate_normalized_stats.py --batch-size 500 --verbose --dry-run

# Force update all records
python populate_normalized_stats.py --force
```

### Update IP Geolocation
```bash
# Update both country and city data
python populate_ip_geolocation.py

# Update only country data
python populate_ip_geolocation.py --country-only

# Update only city data  
python populate_ip_geolocation.py --city-only
```

## Configuration

### Bot Signatures
Edit `populate_normalized_stats.json` to add/remove bot signatures:
```json
{
  "bot_signatures": [
    "bot",
    "crawler",
    "spider",
    "new-signature"
  ]
}
```

### GeoIP Databases
Place GeoIP databases in `resources/geoip/`:
- `GeoLite2-Country.mmdb`
- `GeoLite2-City.mmdb`

## Server Requirements

**The normalization script (`populate_normalized_stats.py`) must be run from the server due to Supabase's IPv6-only connectivity requirements.** Local development environments may not be able to connect to the database.

## Database Schema

The scripts expect the following table structure:
```sql
CREATE TABLE metrics_page_views (
  id bigserial PRIMARY KEY,
  timestamp timestamptz NOT NULL,
  ip text,
  country text,
  city text,
  user_agent text,
  referrer text,
  domain text,
  browser_normalized text,
  os_normalized text,
  device_normalized text,
  referrer_normalized text,
  domain_normalized text
);
```

## Logging

Scripts create log files in the `logs/` directory:
- `populate_normalized_stats.log`
- `populate_ip_geolocation.log`

## Error Handling

- Scripts use batch processing to handle large datasets
- Database transactions are properly managed
- Failed records are logged but don't stop processing
- Dry-run mode available for testing

## Integration with Next.js

These scripts prepare data for the analytics dashboard by:
1. Normalizing user agent data for browser/OS/device analytics
2. Adding geolocation data for country-based visualizations
3. Filtering out bot traffic for accurate user metrics
4. Providing clean data for the stored procedures 