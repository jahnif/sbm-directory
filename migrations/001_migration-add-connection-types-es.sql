-- Add connection_types_es column to adults table
-- Run this in Supabase SQL Editor

ALTER TABLE adults
ADD COLUMN connection_types_es TEXT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN adults.connection_types_es IS 'Spanish translation of connection_types field for bilingual support';

-- Optional: Update existing records to have null values (already done by ADD COLUMN)
-- This is just for verification
SELECT
  id,
  name,
  connection_types,
  connection_types_es
FROM adults
LIMIT 5;