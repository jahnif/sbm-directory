-- Add multiple countries of origin field to adults table with bilingual support
-- Run this in Supabase SQL Editor

-- Add countries_of_origin columns to adults table
-- Using JSONB to store array of country codes
ALTER TABLE adults
ADD COLUMN countries_of_origin JSONB NULL,
ADD COLUMN countries_of_origin_es JSONB NULL;

-- Add comments to document the columns
COMMENT ON COLUMN adults.countries_of_origin IS 'Array of country codes for countries of origin stored as JSONB (primary language)';
COMMENT ON COLUMN adults.countries_of_origin_es IS 'Spanish translation of countries_of_origin field for bilingual support';

-- Create index for better query performance on JSONB column
CREATE INDEX IF NOT EXISTS idx_adults_countries_of_origin ON adults USING GIN (countries_of_origin);
CREATE INDEX IF NOT EXISTS idx_adults_countries_of_origin_es ON adults USING GIN (countries_of_origin_es);

-- Optional: Verify the new columns were added
SELECT
  id,
  name,
  country,
  countries_of_origin,
  countries_of_origin_es,
  city
FROM adults
LIMIT 5;