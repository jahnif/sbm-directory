-- Add Spanish translation fields for professional data
-- This enables industry and job_title to be translated

ALTER TABLE adults
ADD COLUMN industry_es TEXT,
ADD COLUMN job_title_es TEXT;

-- Add comments for clarity
COMMENT ON COLUMN adults.industry_es IS 'Spanish translation of industry field';
COMMENT ON COLUMN adults.job_title_es IS 'Spanish translation of job_title field';