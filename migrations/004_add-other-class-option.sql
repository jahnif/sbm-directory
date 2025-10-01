-- Migration to add 'Other' as a class option for children
-- Run this migration after 003_add-lynx-class-option.sql

-- Drop the existing check constraint
ALTER TABLE children DROP CONSTRAINT children_class_check;

-- Add the new check constraint including 'Other'
ALTER TABLE children ADD CONSTRAINT children_class_check
CHECK (class IN ('Pegasus', 'Lynx', 'Orion', 'Andromeda', 'Other'));