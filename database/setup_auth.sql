-- =============================================
-- User Authentication Setup for Unknown Novel
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- IMPORTANT: This should be run AFTER reader_system.sql

-- 1. Disable email confirmation (for development/internal use)
-- This allows the dummy email approach to work without email verification
-- NOTE: For production, you may want to keep email confirmation enabled

-- Check current auth settings (run this first to see current config)
-- You can view this in: Supabase Dashboard > Authentication > Settings

-- 2. Create a function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'reader')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update RLS policies for profiles (if needed)
-- These should already exist from reader_system.sql, but we'll recreate them to be safe

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Done! 
-- Now test by trying to register a new user
