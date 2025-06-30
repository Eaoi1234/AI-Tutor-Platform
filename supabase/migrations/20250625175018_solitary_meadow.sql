/*
  # Fix user profile data to match registration

  1. Updates
    - Modify handle_new_user function to properly use registration metadata
    - Ensure first_name and last_name come from the actual registration form
    - Use the username from registration metadata
    - Set proper default values when metadata is missing

  2. Security
    - Maintains existing RLS policies
    - Keeps security definer for proper permissions
*/

-- Drop and recreate the handle_new_user function with proper registration data handling
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

  -- Insert into user_profiles with registration data
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
    final_username,
    reg_first_name,
    reg_last_name,
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
      final_username || '_' || floor(random() * 10000)::text,
      reg_first_name,
      reg_last_name,
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

-- Ensure the trigger is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();