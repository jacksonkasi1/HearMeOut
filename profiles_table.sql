-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    emergency_keywords TEXT[] DEFAULT ARRAY['fire', 'help', 'emergency', 'police', 'ambulance'],
    sensitivity_level INTEGER DEFAULT 3,
    enable_flashlight BOOLEAN DEFAULT TRUE,
    enable_vibration BOOLEAN DEFAULT TRUE,
    enable_transcription BOOLEAN DEFAULT TRUE,
    last_detection TIMESTAMP WITH TIME ZONE
);

-- Add comment to the table
COMMENT ON TABLE public.profiles IS 'User profiles for HearMeOut app with user settings and preferences';

-- Create RLS policy for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (id = auth.uid());

-- Policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

-- Create trigger to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_profile_updated_at();

-- Optional: Create a function to auto-create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();