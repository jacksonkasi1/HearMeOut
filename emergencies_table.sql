-- Create the emergencies table
CREATE TABLE IF NOT EXISTS public.emergencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    keyword_detected TEXT NOT NULL,
    device_id TEXT NOT NULL,
    location_latitude FLOAT,
    location_longitude FLOAT,
    transcription_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to the table
COMMENT ON TABLE public.emergencies IS 'Table storing emergency events detected by the HearMeOut app';

-- Example insert statement
-- INSERT INTO public.emergencies (keyword_detected, device_id, location_latitude, location_longitude, transcription_snippet)
-- VALUES ('fire', '550e8400-e29b-41d4-a716-446655440000', 37.7749, -122.4194, 'I think there is a fire in the building, we need to evacuate now.');

-- Create RLS policy for emergencies table
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert data
CREATE POLICY "Allow authenticated users to insert emergencies" 
ON public.emergencies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy to allow users to read only their own data
CREATE POLICY "Allow users to read their own emergencies" 
ON public.emergencies 
FOR SELECT 
TO authenticated 
USING (device_id = auth.uid()::text);

-- If you want to allow anonymous inserts (public access, no auth required)
-- CREATE POLICY "Allow public insert access" 
-- ON public.emergencies 
-- FOR INSERT 
-- TO anon
-- WITH CHECK (true);