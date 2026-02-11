-- =============================================
-- Simple Auth Setup for Unknown Novel
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- 1. IMPORTANT: Pastikan table profiles sudah ada
-- Jika belum, run file reader_system.sql dulu

-- 2. Remove any existing trigger (if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Verify profiles table exists and has correct structure
-- Uncomment baris di bawah untuk melihat struktur table
-- \d profiles;

-- 4. Make sure RLS is properly configured
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. CRITICAL: Disable email confirmation
-- Go to: Dashboard > Authentication > Email Auth Provider
-- Turn OFF "Enable email confirmations"

-- Done!
-- Profile will be created by JavaScript code, not by trigger
