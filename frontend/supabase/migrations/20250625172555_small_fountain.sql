/*
  # Fix user signup trigger function

  1. Problem
    - The handle_new_user trigger is failing because required fields (username, first_name, last_name) 
      in user_profiles table don't have default values
    - This causes a database error when new users try to sign up

  2. Solution
    - Update the handle_new_user trigger function to provide default values for required fields
    - Use email prefix as default username and split email for name fields
    - Ensure the trigger handles all required NOT NULL fields properly

  3. Changes
    - Recreate the handle_new_user function with proper default value handling
    - Add error handling to prevent signup failures
*/

-- Drop and recreate the handle_new_user function with proper defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_prefix TEXT;
  default_first_name TEXT;
  default_last_name TEXT;
BEGIN
  -- Extract email prefix for username (before @)
  email_prefix := split_part(NEW.email, '@', 1);
  
  -- Set default names based on email or use generic defaults
  default_first_name := COALESCE(
    split_part(split_part(NEW.email, '@', 1), '.', 1),
    'User'
  );
  
  default_last_name := COALESCE(
    NULLIF(split_part(split_part(NEW.email, '@', 1), '.', 2), ''),
    'Student'
  );

  -- Insert into user_profiles with all required fields
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
    academic_info,
    preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    email_prefix,
    default_first_name,
    default_last_name,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"gpa": null, "year": null, "major": null, "student_id": null, "enrolled_subjects": []}'::jsonb,
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
      academic_info,
      preferences,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      email_prefix || '_' || floor(random() * 10000)::text,
      default_first_name,
      default_last_name,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '{"gpa": null, "year": null, "major": null, "student_id": null, "enrolled_subjects": []}'::jsonb,
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

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();