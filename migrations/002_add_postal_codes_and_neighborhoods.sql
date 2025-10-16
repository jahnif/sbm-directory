-- Migration: Add postal codes and neighborhoods for Valencia
-- Description: Adds support for neighborhood selection and postal code-based proximity search

-- Create postal codes lookup table for Valencia province
CREATE TABLE IF NOT EXISTS codigos_postales (
  codigo_postal VARCHAR(5) PRIMARY KEY,
  localidad VARCHAR(100) NOT NULL,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add neighborhood and postal code fields to adults table
ALTER TABLE adults
  ADD COLUMN IF NOT EXISTS barrio VARCHAR(100),
  ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(5);

-- Add validation constraint: postal codes must start with 46 (Valencia province)
-- Note: If constraint already exists, this will fail gracefully - you can ignore the error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_valencia_codigo_postal'
  ) THEN
    ALTER TABLE adults
      ADD CONSTRAINT check_valencia_codigo_postal
      CHECK (codigo_postal ~ '^46[0-9]{3}$' OR codigo_postal IS NULL);
  END IF;
END $$;

-- Create index for faster postal code lookups
CREATE INDEX IF NOT EXISTS idx_adults_codigo_postal ON adults(codigo_postal);
CREATE INDEX IF NOT EXISTS idx_adults_barrio ON adults(barrio);

-- Add foreign key relationship (optional, but helps maintain data integrity)
-- Note: If constraint already exists, this will fail gracefully - you can ignore the error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_adults_codigo_postal'
  ) THEN
    ALTER TABLE adults
      ADD CONSTRAINT fk_adults_codigo_postal
      FOREIGN KEY (codigo_postal) REFERENCES codigos_postales(codigo_postal)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Instructions for importing data:
-- After running this migration, import the valencia_postal_codes.csv file
-- Example using Supabase SQL Editor or psql:
-- COPY codigos_postales(codigo_postal, localidad, latitud, longitud)
-- FROM '/path/to/valencia_postal_codes.csv'
-- DELIMITER ','
-- CSV;

-- Note: Row Level Security policies should be added if needed
-- Enable RLS on postal codes table
ALTER TABLE codigos_postales ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read postal codes (public data)
CREATE POLICY IF NOT EXISTS "Allow public read access to postal codes"
  ON codigos_postales FOR SELECT
  USING (true);
