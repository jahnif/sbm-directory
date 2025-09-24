-- Migration to add contact fields and translation support
-- Run this after the initial setup

-- Add email and WhatsApp fields to adults table
ALTER TABLE adults
ADD COLUMN email VARCHAR(255),
ADD COLUMN whatsapp_number VARCHAR(50),
ADD COLUMN show_contact_in_networking BOOLEAN DEFAULT FALSE;

-- Add translation fields to families table
ALTER TABLE families
ADD COLUMN family_name_es VARCHAR(255),
ADD COLUMN description_es TEXT,
ADD COLUMN original_language VARCHAR(2) DEFAULT 'en';

-- Add translation fields to adults table
ALTER TABLE adults
ADD COLUMN name_es VARCHAR(255);

-- Add translation fields to children table
ALTER TABLE children
ADD COLUMN name_es VARCHAR(255);

-- Add missing country and city fields (these seem to exist in types but not in current schema)
ALTER TABLE adults
ADD COLUMN country VARCHAR(100),
ADD COLUMN city VARCHAR(100);