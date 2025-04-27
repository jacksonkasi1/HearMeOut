# HearMeOut Supabase Database Setup

This document provides instructions for setting up the Supabase database schema for the HearMeOut application.

## Prerequisites

1. Supabase project already created
2. Access to Supabase CLI or SQL Editor in Supabase Dashboard

## Database Schema Setup

### Option 1: Using Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the contents of `emergencies_table.sql` into the editor
5. Run the query

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the SQL migration
supabase db push emergencies_table.sql
```

## Test Inserting Data

You can test inserting data using the SQL Editor in Supabase dashboard:

```sql
INSERT INTO public.emergencies 
(keyword_detected, device_id, location_latitude, location_longitude, transcription_snippet)
VALUES 
('fire', '550e8400-e29b-41d4-a716-446655440000', 37.7749, -122.4194, 'I think there is a fire in the building, we need to evacuate now.');
```

## Frontend Integration

The React Native hook `useEmergencyEvents` has been created in `hooks/useEmergencyEvents.ts`. 

### Example Usage

```typescript
import { useEmergencyEvents, EmergencyEvent } from '@/hooks/useEmergencyEvents';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have an auth hook

function MyComponent() {
  const { user } = useAuth();
  const { insertEmergencyEvent, isLoading, error } = useEmergencyEvents();

  const handleEmergencyDetection = async (keyword: string, transcription: string) => {
    if (!user) return;
    
    const emergencyData: EmergencyEvent = {
      keyword_detected: keyword,
      device_id: user.id,
      transcription_snippet: transcription,
      // Add location if available
      // location_latitude: currentLocation?.latitude,
      // location_longitude: currentLocation?.longitude,
    };
    
    const result = await insertEmergencyEvent(emergencyData);
    
    if (result) {
      console.log('Emergency event recorded:', result);
      // Handle successful recording
    }
  };
  
  return (
    // ...your component JSX
  );
}
```

## Row-Level Security (RLS)

The SQL scripts include RLS policies that:

1. Allow authenticated users to insert emergency data
2. Allow users to read only their own data
3. (Optional, commented out) Allow anonymous public inserts

If your app doesn't use authentication yet, you can uncomment the public insert policy in the SQL file. 