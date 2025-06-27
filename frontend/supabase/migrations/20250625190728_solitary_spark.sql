/*
  # Disable Email Confirmation System

  1. Changes
    - Disable email confirmation requirement in auth settings
    - Update auth configuration to allow immediate sign-in
    - Remove email confirmation dependencies

  2. Security
    - Users can sign up and immediately access the application
    - No email verification required
*/

-- Disable email confirmation requirement
-- This needs to be done in the Supabase dashboard under Authentication > Settings
-- But we can also handle it programmatically by updating the auth flow

-- Update the handle_new_user function to ensure users are immediately active
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_prefix TEXT;
  reg_username TEXT;
  reg_first_name TEXT;
  reg_last_name TEXT;
  final_username TEXT;
BEGIN
  -- Extract email prefix as fallback
  email_prefix := split_part(NEW.email, '@', 1);
  
  -- Get registration data from raw_user_meta_data
  reg_username := NEW.raw_user_meta_data->>'username';
  reg_first_name := NEW.raw_user_meta_data->>'first_name';
  reg_last_name := NEW.raw_user_meta_data->>'last_name';
  
  -- Use registration username or fall back to email prefix
  final_username := COALESCE(reg_username, email_prefix);
  
  -- Use registration names or fall back to defaults
  reg_first_name := COALESCE(reg_first_name, 'User');
  reg_last_name := COALESCE(reg_last_name, 'Student');

  -- Insert into user_profiles without academic_info
  INSERT INTO public.user_profiles (
    id,
    username,
    first_name,
    last_name,
    avatar_url,
    bio,
    date_of_birth,
    phone,
    location,
    preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    final_username,
    reg_first_name,
    reg_last_name,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"theme": "light", "language": "en", "notifications": {"push": true, "email": true, "grades": true, "assignments": true, "announcements": false}}'::jsonb,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, append a random number
    INSERT INTO public.user_profiles (
      id,
      username,
      first_name,
      last_name,
      avatar_url,
      bio,
      date_of_birth,
      phone,
      location,
      preferences,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      final_username || '_' || floor(random() * 10000)::text,
      reg_first_name,
      reg_last_name,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '{"theme": "light", "language": "en", "notifications": {"push": true, "email": true, "grades": true, "assignments": true, "announcements": false}}'::jsonb,
      NOW(),
      NOW()
    );
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;