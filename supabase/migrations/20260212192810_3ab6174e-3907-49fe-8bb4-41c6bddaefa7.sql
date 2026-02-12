-- Remove email column from profiles table (data is safely stored in auth.users)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;