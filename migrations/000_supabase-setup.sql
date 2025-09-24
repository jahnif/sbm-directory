-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create adults table
CREATE TABLE adults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    industry VARCHAR(255),
    job_title VARCHAR(255),
    interested_in_connections BOOLEAN DEFAULT FALSE,
    connection_types TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    class VARCHAR(50) CHECK (class IN ('Pegasus', 'Orion', 'Andromeda')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for families
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE adults ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access to all authenticated users)
CREATE POLICY "Allow read access to families" ON families FOR SELECT USING (true);
CREATE POLICY "Allow read access to adults" ON adults FOR SELECT USING (true);
CREATE POLICY "Allow read access to children" ON children FOR SELECT USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to families" ON families FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access to adults" ON adults FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access to children" ON children FOR INSERT WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access to families" ON families FOR UPDATE USING (true);
CREATE POLICY "Allow update access to adults" ON adults FOR UPDATE USING (true);
CREATE POLICY "Allow update access to children" ON children FOR UPDATE USING (true);

-- Allow delete access to authenticated users
CREATE POLICY "Allow delete access to families" ON families FOR DELETE USING (true);
CREATE POLICY "Allow delete access to adults" ON adults FOR DELETE USING (true);
CREATE POLICY "Allow delete access to children" ON children FOR DELETE USING (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('family-images', 'family-images', true);

-- Create policy for storage bucket
CREATE POLICY "Allow public access to family images" ON storage.objects FOR SELECT USING (bucket_id = 'family-images');
CREATE POLICY "Allow authenticated uploads to family images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'family-images');
CREATE POLICY "Allow authenticated updates to family images" ON storage.objects FOR UPDATE USING (bucket_id = 'family-images');
CREATE POLICY "Allow authenticated deletes to family images" ON storage.objects FOR DELETE USING (bucket_id = 'family-images');