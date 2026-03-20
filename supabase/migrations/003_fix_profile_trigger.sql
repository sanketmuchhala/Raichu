-- =============================================
-- Fix: More robust profile trigger for OAuth users
-- =============================================

-- Drop and recreate the trigger function with better handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Build username: prefer provided username, then email prefix, then UUID fallback
  _username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
    'user_' || LEFT(NEW.id::text, 8)
  );

  -- Ensure uniqueness: if username already taken, append short UUID suffix
  IF EXISTS (SELECT 1 FROM profiles WHERE username = _username) THEN
    _username := _username || '_' || LEFT(NEW.id::text, 4);
  END IF;

  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    _username,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also add an INSERT policy for profiles so the service role trigger works cleanly
-- (SECURITY DEFINER as postgres bypasses RLS, but this is belt-and-suspenders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can insert profiles'
  ) THEN
    CREATE POLICY "Service role can insert profiles"
      ON profiles FOR INSERT
      WITH CHECK (true);
  END IF;
END;
$$;
