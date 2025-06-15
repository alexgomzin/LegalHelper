-- Admin Unlimited Credits Setup
-- Run this query in your Supabase SQL Editor to give admin unlimited credits

-- First, insert or update the admin profile with the specific user_id from your logs
INSERT INTO public.profiles (
  id,
  email, 
  name,
  credits_remaining, 
  subscription_tier, 
  subscription_status,
  created_at,
  updated_at
) VALUES (
  '971b8cd0-8eb3-4f9b-94b0-34175c432baa',
  'g0mzinaldo@yandex.ru',
  'Admin',
  999999,
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'g0mzinaldo@yandex.ru',
  name = 'Admin',
  credits_remaining = 999999,
  subscription_tier = 'admin',
  subscription_status = 'active',
  updated_at = NOW();

-- Verify the update
SELECT 
  id,
  email, 
  credits_remaining, 
  subscription_tier, 
  subscription_status,
  updated_at
FROM public.profiles 
WHERE email = 'g0mzinaldo@yandex.ru' OR id = '971b8cd0-8eb3-4f9b-94b0-34175c432baa'; 