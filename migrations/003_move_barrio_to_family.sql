-- Migration: Move barrio and codigo_postal from adults table to families table
-- This makes more sense as a family typically lives in one neighborhood/postal code

-- Step 1: Add columns to families table
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS barrio VARCHAR(100),
  ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(5);

-- Step 2: Migrate existing data from adults to families
-- Take the first adult's barrio and codigo_postal for each family
WITH first_adult_data AS (
  SELECT DISTINCT ON (family_id)
    family_id,
    barrio,
    codigo_postal
  FROM adults
  WHERE barrio IS NOT NULL OR codigo_postal IS NOT NULL
  ORDER BY family_id, created_at
)
UPDATE families f
SET
  barrio = COALESCE(f.barrio, fad.barrio),
  codigo_postal = COALESCE(f.codigo_postal, fad.codigo_postal)
FROM first_adult_data fad
WHERE f.id = fad.family_id;

-- Step 3: Drop columns from adults table
ALTER TABLE adults
  DROP COLUMN IF EXISTS barrio,
  DROP COLUMN IF EXISTS codigo_postal;

-- Note: The constraint check_valencia_codigo_postal was on adults table
-- We should add it to families table instead

DO $$
BEGIN
  -- Drop the old constraint from adults if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_valencia_codigo_postal'
    AND conrelid = 'adults'::regclass
  ) THEN
    ALTER TABLE adults DROP CONSTRAINT check_valencia_codigo_postal;
  END IF;

  -- Add the constraint to families table
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_valencia_codigo_postal'
    AND conrelid = 'families'::regclass
  ) THEN
    ALTER TABLE families
      ADD CONSTRAINT check_valencia_codigo_postal
      CHECK (codigo_postal ~ '^46[0-9]{3}$' OR codigo_postal IS NULL);
  END IF;
END $$;
