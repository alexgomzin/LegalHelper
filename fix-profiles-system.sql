-- ===== FIX PROFILES SYSTEM =====
-- This SQL will create automatic profile creation for all new users
-- and fix missing profiles for existing users

-- 1. Create the trigger function that automatically creates profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_remaining, subscription_tier, subscription_status, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 0, 'free', 'inactive', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicates if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger that fires when a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Fix existing users who don't have profiles
-- This will create profiles for all existing auth users who are missing them
INSERT INTO public.profiles (id, email, credits_remaining, subscription_tier, subscription_status, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  0 as credits_remaining,
  'free' as subscription_tier,
  'inactive' as subscription_status,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL; -- Only insert for users who don't have profiles

-- 4. Verify the fix worked
SELECT 
  'auth.users count' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'profiles count' as table_name, 
  COUNT(*) as count 
FROM public.profiles
UNION ALL
SELECT 
  'missing profiles' as table_name, 
  COUNT(*) as count 
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL; 