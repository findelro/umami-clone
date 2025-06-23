#!/usr/bin/env python
import os
import sys
import time
import argparse
import geoip2.database
from geoip2.errors import AddressNotFoundError
import ipaddress
import logging
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler("logs/populate_ip_geolocation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DatabaseConnection:
    """Database connection manager for Supabase."""
    
    def __init__(self):
        self.conn = None
        self.cur = None
        
    def __enter__(self):
        try:
            # Connect to Supabase PostgreSQL
            logger.info("Connecting to database...")
            self.conn = psycopg2.connect(
                host=os.getenv('SUPABASE_PSQL_DB_HOST'),
                dbname=os.getenv('SUPABASE_PSQL_DB_NAME'),
                user=os.getenv('SUPABASE_PSQL_DB_USER'),
                password=os.getenv('SUPABASE_PSQL_DB_PASSWORD'),
                port=5432,
                sslmode='require'
            )
            self.cur = self.conn.cursor()
            logger.info("Connected to database")
            return self
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            if self.conn:
                self.conn.close()
            raise
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            if self.conn:
                self.conn.rollback()
            logger.error(f"Database error: {exc_val}")
        
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
    
    def execute(self, query, params=None):
        """Execute a database query with parameters."""
        self.cur.execute(query, params)
        return self.cur
    
    def commit(self):
        """Commit the current transaction."""
        self.conn.commit()
        
    def fetchall(self):
        """Fetch all results from the last query."""
        return self.cur.fetchall()

class GeoIPUpdater:
    """Class to update missing country and city information for IP addresses in the database."""
    
    # GeoLite2 database paths
    DB_DIRECTORY = Path("resources/geoip")
    COUNTRY_DB_PATH = DB_DIRECTORY / "GeoLite2-Country.mmdb"
    CITY_DB_PATH = DB_DIRECTORY / "GeoLite2-City.mmdb"
    
    # Standard codes for unknown values
    UNKNOWN_COUNTRY = "ZZ"  # Reserved code for unknown or unspecified countries
    
    def __init__(self, batch_size=1000, max_records=None, update_country=True, update_city=True, 
                 dry_run=False, table_name="metrics_page_views", verbose=False, force=False):
        """Initialize the GeoIP updater."""
        self.batch_size = batch_size
        self.max_records = max_records
        self.update_country = update_country
        self.update_city = update_city
        self.dry_run = dry_run
        self.table_name = table_name
        self.verbose = verbose
        self.force = force
        
        if verbose:
            logger.debug(f"Configuration: batch_size={batch_size}, max_records={max_records}, "
                        f"update_country={update_country}, update_city={update_city}, "
                        f"dry_run={dry_run}, force={force}, table={table_name}")
        
        # Validate databases exist based on what we need to update
        if self.update_country and not self.COUNTRY_DB_PATH.exists():
            raise FileNotFoundError(
                f"GeoIP country database not found at {self.COUNTRY_DB_PATH}.\n"
                "Please download the free GeoLite2 Country database from:\n"
                "https://dev.maxmind.com/geoip/geolite2-free-geolocation-data\n"
                f"Place the extracted .mmdb file in the {self.DB_DIRECTORY} directory as 'GeoLite2-Country.mmdb'."
            )
            
        if self.update_city and not self.CITY_DB_PATH.exists():
            raise FileNotFoundError(
                f"GeoIP city database not found at {self.CITY_DB_PATH}.\n"
                "Please download the free GeoLite2 City database from:\n"
                "https://dev.maxmind.com/geoip/geolite2-free-geolocation-data\n"
                f"Place the extracted .mmdb file in the {self.DB_DIRECTORY} directory as 'GeoLite2-City.mmdb'."
            )
        
        # Open GeoIP readers based on what we need to update
        if self.update_country:
            self.country_reader = geoip2.database.Reader(str(self.COUNTRY_DB_PATH))
            logger.debug(f"Initialized GeoIP country reader with database at {self.COUNTRY_DB_PATH}")
            
        if self.update_city:
            self.city_reader = geoip2.database.Reader(str(self.CITY_DB_PATH))
            logger.debug(f"Initialized GeoIP city reader with database at {self.CITY_DB_PATH}")
    
    def is_valid_ip(self, ip_str):
        """Check if the string is a valid IP address."""
        if not ip_str:
            return False
            
        try:
            ipaddress.ip_address(ip_str)
            return True
        except ValueError:
            return False
    
    def get_ip_location(self, ip_str):
        """Get location information for an IP address."""
        if not self.is_valid_ip(ip_str):
            return self.UNKNOWN_COUNTRY, None
        
        country = self.UNKNOWN_COUNTRY
        city = None
            
        # Get country information if needed
        if self.update_country:
            try:
                response = self.country_reader.country(ip_str)
                country = response.country.iso_code if response.country.iso_code else self.UNKNOWN_COUNTRY
            except AddressNotFoundError:
                pass
            except Exception as e:
                logger.error(f"Error looking up country for IP {ip_str}: {e}")
        
        # Get city information if needed
        if self.update_city:
            try:
                response = self.city_reader.city(ip_str)
                city = response.city.name if response.city.name else None
            except AddressNotFoundError:
                pass
            except Exception as e:
                logger.error(f"Error looking up city for IP {ip_str}: {e}")
                
        return country, city
    
    def get_records_to_update(self, db, limit=None):
        """Get records with IP addresses that need updating."""
        where_clauses = []
        
        if not self.force:
            # Only include NULL checks if not forcing update of all records
            if self.update_country:
                where_clauses.append("country IS NULL")
                
            if self.update_city:
                where_clauses.append("city IS NULL")
                
            if not where_clauses:
                logger.warning("No fields selected for update (country or city).")
                return []
                
            where_condition = " OR ".join(where_clauses)
            where_clause = f"WHERE ip IS NOT NULL AND ({where_condition})"
        else:
            # When forcing, just check for non-NULL IPs
            where_clause = "WHERE ip IS NOT NULL"
            
            if self.verbose:
                logger.debug("Force flag is set - processing all records with non-NULL IPs")
        
        query = f"""
            SELECT id, ip FROM {self.table_name}
            {where_clause}
            ORDER BY id
        """
        
        if limit:
            query += f" LIMIT {limit}"
        
        if self.verbose:
            logger.debug(f"Query: {query}")
            
        db.execute(query)
        return db.fetchall()
    
    def validate_table(self, db):
        """Validate that the table exists and has the correct columns."""
        try:
            # Check if table exists
            db.execute(f"SELECT 1 FROM information_schema.tables WHERE table_name = '{self.table_name}'")
            if not db.fetchall():
                logger.error(f"Table '{self.table_name}' does not exist")
                return False
            
            # Check for required columns
            required_columns = ['id', 'ip']
            if self.update_country:
                required_columns.append('country')
            if self.update_city:
                required_columns.append('city')
                
            for column in required_columns:
                db.execute(f"SELECT 1 FROM information_schema.columns WHERE table_name = '{self.table_name}' AND column_name = '{column}'")
                if not db.fetchall():
                    logger.error(f"Column '{column}' does not exist in table '{self.table_name}'")
                    return False
            
            return True
        except Exception as e:
            logger.error(f"Table validation error: {e}")
            return False
    
    def update_record(self, db, record_id, country, city):
        """Update country and/or city for a record."""
        try:
            # Build the query dynamically based on what needs to be updated
            set_clauses = []
            params = []
            
            if self.update_country:
                set_clauses.append("country = %s")
                params.append(country)
                
            if self.update_city:
                set_clauses.append("city = %s")
                params.append(city)
                
            if not set_clauses:
                return False
                
            set_clause = ", ".join(set_clauses)
            
            query = f"""
                UPDATE {self.table_name}
                SET {set_clause}
                WHERE id = %s
            """
            params.append(record_id)
            
            if self.dry_run:
                if self.verbose:
                    logger.debug(f"DRY RUN: Would execute: {query} with params {params}")
                return True
            
            db.execute(query, tuple(params))
            return True
        except Exception as e:
            logger.error(f"Error updating record {record_id}: {e}")
            return False
    
    def process_records(self):
        """Process records with missing location data."""
        processed_count = 0
        updated_count = 0
        country_unknown_count = 0
        city_unknown_count = 0
        start_time = time.time()
        
        with DatabaseConnection() as db:
            # Validate table structure
            if not self.validate_table(db):
                logger.error("Table validation failed. Aborting.")
                return False
                
            records_to_update = self.get_records_to_update(db, self.max_records)
            total_records = len(records_to_update)
            
            if total_records == 0:
                logger.info("No records found that need location data updated.")
                return True
                
            logger.info(f"Processing {total_records} records")
            
            # Process records in batches
            for i in range(0, total_records, self.batch_size):
                batch = records_to_update[i:i+self.batch_size]
                batch_start_time = time.time()
                batch_updated = 0
                batch_country_unknown = 0
                batch_city_unknown = 0
                
                for record_id, ip in batch:
                    country, city = self.get_ip_location(ip)
                    
                    if self.update_record(db, record_id, country, city):
                        batch_updated += 1
                        
                        if self.update_country and country == self.UNKNOWN_COUNTRY:
                            batch_country_unknown += 1
                            
                        if self.update_city and city == None:
                            batch_city_unknown += 1
                            
                    processed_count += 1
                
                # Commit after each batch unless in dry run mode
                if not self.dry_run:
                    db.commit()
                    
                updated_count += batch_updated
                country_unknown_count += batch_country_unknown
                city_unknown_count += batch_city_unknown
                
                batch_time = time.time() - batch_start_time
                
                # Build concise batch progress message
                batch_number = i//self.batch_size + 1
                total_batches = (total_records + self.batch_size - 1)//self.batch_size
                
                status = f"Batch {batch_number}/{total_batches}: {len(batch)} records ({batch_time:.1f}s)"
                if batch_country_unknown > 0 or batch_city_unknown > 0:
                    unknown_parts = []
                    if batch_country_unknown > 0:
                        unknown_parts.append(f"{batch_country_unknown} countries unknown")
                    if batch_city_unknown > 0:
                        unknown_parts.append(f"{batch_city_unknown} cities unknown")
                    if unknown_parts:
                        status += f" ({', '.join(unknown_parts)})"
                
                logger.info(status)
                
                # Calculate progress only for long-running jobs
                if total_records > 10000:
                    progress = processed_count / total_records
                    elapsed = time.time() - start_time
                    estimated_total = elapsed / progress if progress > 0 else 0
                    remaining = max(0, estimated_total - elapsed)
                    
                    logger.info(f"Progress: {progress:.0%}, ETA: {remaining/60:.1f} minutes")
        
        # Build concise summary message
        total_time = time.time() - start_time
        summary = f"Completed: {processed_count} records processed in {total_time:.1f}s"
        
        if country_unknown_count > 0 or city_unknown_count > 0:
            unknown_parts = []
            if country_unknown_count > 0:
                unknown_parts.append(f"{country_unknown_count} countries unknown")
            if city_unknown_count > 0:
                unknown_parts.append(f"{city_unknown_count} cities unknown")
            if unknown_parts:
                summary += f" ({', '.join(unknown_parts)})"
        
        logger.info(summary)
        return True
    
    def close(self):
        """Close the GeoIP readers."""
        if hasattr(self, 'country_reader'):
            self.country_reader.close()
            
        if hasattr(self, 'city_reader'):
            self.city_reader.close()

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Update IP geolocation data in the database.',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    parser.add_argument('--country-only', action='store_true',
                        help='Update only country information')
    parser.add_argument('--city-only', action='store_true',
                        help='Update only city information')
    parser.add_argument('--batch-size', type=int, default=1000,
                        help='Number of records to process in each batch')
    parser.add_argument('--max-records', type=int,
                        help='Maximum number of records to process')
    parser.add_argument('--dry-run', action='store_true',
                        help='Don\'t actually update the database')
    parser.add_argument('--force', action='store_true',
                        help='Process all records, not just those with NULL values')
    parser.add_argument('--table', default='metrics_page_views',
                        help='Name of the table to update')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Print verbose output')
    
    return parser.parse_args()

def main():
    """Main function to run the IP geolocation updater."""
    try:
        args = parse_args()
        
        # Determine what to update based on command line arguments
        update_country = not args.city_only
        update_city = not args.country_only
        
        if args.country_only and args.city_only:
            logger.error("Cannot specify both --country-only and --city-only")
            return 1
        
        updater = GeoIPUpdater(
            batch_size=args.batch_size,
            max_records=args.max_records,
            update_country=update_country,
            update_city=update_city,
            dry_run=args.dry_run,
            table_name=args.table,
            verbose=args.verbose,
            force=args.force
        )
        
        # Log what we're going to update
        update_targets = []
        if update_country:
            update_targets.append("country")
        if update_city:
            update_targets.append("city")
            
        if not update_targets:
            logger.error("No fields selected for update. Please enable at least one of: country, city")
            return 1
            
        logger.info(f"Starting IP geolocation update for: {', '.join(update_targets)}")
        
        if args.dry_run:
            logger.info("DRY RUN: No database changes will be made")
            
        success = updater.process_records()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        logger.warning("Process interrupted by user")
        return 130
    except FileNotFoundError as e:
        logger.error(f"{e}")
        print(f"ERROR: {e}")
        return 1
    except Exception as e:
        logger.error(f"Error running IP geolocation updater: {e}")
        return 1
    finally:
        if 'updater' in locals():
            updater.close()

if __name__ == "__main__":
    sys.exit(main()) 