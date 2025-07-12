-- First, let's manually create the profile for the current user
INSERT INTO public.profiles (id, email, credits_remaining, subscription_tier, subscription_status, created_at, updated_at)
VALUES ('3073b241-361d-428b-b001-1408f44c3ae8', '', 0, 'free', 'inactive', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create a trigger function that automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_remaining, subscription_tier, subscription_status, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 0, 'free', 'inactive', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and create a new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated; 