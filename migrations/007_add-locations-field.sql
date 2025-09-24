-- Add locations field to adults table with bilingual support
-- Run this in Supabase SQL Editor

-- Add locations columns to adults table
-- Using JSONB to store array of location objects with country and city
ALTER TABLE adults
ADD COLUMN locations JSONB NULL,
ADD COLUMN locations_es JSONB NULL;

-- Add comments to document the columns
COMMENT ON COLUMN adults.locations IS 'Array of location objects with country code and city name stored as JSONB (primary language)';
COMMENT ON COLUMN adults.locations_es IS 'Spanish translation of locations field for bilingual support';

-- Create index for better query performance on JSONB column
CREATE INDEX IF NOT EXISTS idx_adults_locations ON adults USING GIN (locations);
CREATE INDEX IF NOT EXISTS idx_adults_locations_es ON adults USING GIN (locations_es);

-- Optional: Migrate existing data by combining country + city into first location entry
-- This will create a location entry for each adult that has either country or city data
UPDATE adults
SET locations =
  CASE
    WHEN country IS NOT NULL OR city IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object(
          'country', COALESCE(country, ''),
          'city', COALESCE(city, '')
        )
      )
    ELSE NULL
  END
WHERE country IS NOT NULL OR city IS NOT NULL;

-- Optional: Verify the new columns and data migration
SELECT
  id,
  name,
  country,
  city,
  locations,
  locations_es
FROM adults
LIMIT 5;