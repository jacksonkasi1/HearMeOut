import { useState } from 'react';
import { supabase } from '@/supabase/client';

// Interface for emergency event data
export interface EmergencyEvent {
  keyword_detected: string;
  device_id: string;
  location_latitude?: number;
  location_longitude?: number;
  transcription_snippet?: string;
}

export function useEmergencyEvents() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Insert a new emergency event into the emergencies table
   * @param emergencyData The emergency event data to insert
   * @returns The inserted record or error
   */
  const insertEmergencyEvent = async (emergencyData: EmergencyEvent) => {
    try {
      setIsLoading(true);
      setError(null);

      // Insert the emergency event into the Supabase table
      const { data, error } = await supabase
        .from('emergencies')
        .insert([emergencyData])
        .select('id, timestamp, keyword_detected')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to insert emergency event';
      setError(errorMessage);
      console.error('Error inserting emergency event:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all emergency events for the current device/user
   * @param deviceId The device ID to filter events by
   * @returns Array of emergency events
   */
  const getEmergencyEvents = async (deviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch emergency events';
      setError(errorMessage);
      console.error('Error fetching emergency events:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    insertEmergencyEvent,
    getEmergencyEvents,
    isLoading,
    error,
  };
} 