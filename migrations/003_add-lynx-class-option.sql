-- Migration to add 'Lynx' as a class option for children
-- Run this migration after 002_database-migration.sql

-- Drop the existing check constraint
ALTER TABLE children DROP CONSTRAINT children_class_check;

-- Add the new check constraint including 'Lynx'
ALTER TABLE children ADD CONSTRAINT children_class_check
CHECK (class IN ('Pegasus', 'Lynx', 'Orion', 'Andromeda'));