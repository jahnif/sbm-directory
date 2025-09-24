-- Add languages_spoken field to adults table with bilingual support
-- Run this in Supabase SQL Editor

-- Add languages_spoken columns to adults table
-- Using JSONB to store array of language objects with language and proficiency
ALTER TABLE adults
ADD COLUMN languages_spoken JSONB NULL,
ADD COLUMN languages_spoken_es JSONB NULL;

-- Add comments to document the columns
COMMENT ON COLUMN adults.languages_spoken IS 'Languages spoken with proficiency levels stored as JSONB array (primary language)';
COMMENT ON COLUMN adults.languages_spoken_es IS 'Spanish translation of languages_spoken field for bilingual support';

-- Create index for better query performance on JSONB column
CREATE INDEX IF NOT EXISTS idx_adults_languages_spoken ON adults USING GIN (languages_spoken);
CREATE INDEX IF NOT EXISTS idx_adults_languages_spoken_es ON adults USING GIN (languages_spoken_es);

-- Optional: Verify the new columns were added
SELECT
  id,
  name,
  languages_spoken,
  languages_spoken_es,
  country,
  city
FROM adults
LIMIT 5;