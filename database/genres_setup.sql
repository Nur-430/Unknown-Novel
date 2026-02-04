-- =============================================
-- Genre System Database Setup for Unknown Novel
-- Run this SQL in Supabase Dashboard > SQL Editor
-- =============================================

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Allow public read access to genres
CREATE POLICY "Allow public read genres" ON genres
  FOR SELECT USING (true);

-- Allow authenticated users to manage genres (insert, update, delete)
CREATE POLICY "Allow authenticated insert genres" ON genres
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update genres" ON genres
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete genres" ON genres
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default genres
INSERT INTO genres (name, slug) VALUES
  ('Action', 'action'),
  ('Adult', 'adult'),
  ('Adventure', 'adventure'),
  ('Comedy', 'comedy'),
  ('Drama', 'drama'),
  ('Ecchi', 'ecchi'),
  ('Fantasy', 'fantasy'),
  ('Harem', 'harem'),
  ('Historical', 'historical'),
  ('Horror', 'horror'),
  ('Mecha', 'mecha'),
  ('Mystery', 'mystery'),
  ('Psychological', 'psychological'),
  ('Romance', 'romance'),
  ('School', 'school'),
  ('Slice of Life', 'slice-of-life'),
  ('Sci-Fi', 'sci-fi'),
  ('Supernatural', 'supernatural'),
  ('Tragedy', 'tragedy')
ON CONFLICT (name) DO NOTHING;

-- Verify genres were created
SELECT * FROM genres ORDER BY name;
