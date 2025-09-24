-- Add hobbies field to adults table with bilingual support
-- Run this in Supabase SQL Editor

-- Add hobbies columns to adults table
ALTER TABLE adults
ADD COLUMN hobbies TEXT NULL,
ADD COLUMN hobbies_es TEXT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN adults.hobbies IS 'Personal interests and hobbies of the adult (primary language)';
COMMENT ON COLUMN adults.hobbies_es IS 'Spanish translation of hobbies field for bilingual support';

-- Optional: Verify the new columns were added
SELECT
  id,
  name,
  hobbies,
  hobbies_es,
  industry,
  job_title
FROM adults
LIMIT 5;