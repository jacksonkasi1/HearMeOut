import { create } from 'zustand';
import { supabase } from '@/supabase/client';
import { Profile } from '@/types';
import { useAuthStore } from './authStore';
import { toast } from '@/components/ui/Toast';
import { PostgrestError } from '@supabase/supabase-js';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<Profile | null>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateEmergencyKeywords: (keywords: string[]) => Promise<void>;
  updateSensitivityLevel: (level: number) => Promise<void>;
  toggleFlashlight: (enabled: boolean) => Promise<void>;
  toggleVibration: (enabled: boolean) => Promise<void>;
  toggleTranscription: (enabled: boolean) => Promise<void>;
  createProfileIfNotExists: () => Promise<Profile | null>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  
  fetchProfile: async () => {
    const userId = useAuthStore.getState().getUserId();
    console.log('[ProfileStore] fetchProfile - userId:', userId);
    
    if (!userId) {
      const errorMsg = 'User not authenticated';
      console.error('[ProfileStore] fetchProfile error:', errorMsg);
      set({ error: errorMsg });
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log('[ProfileStore] Querying profiles table for userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[ProfileStore] Supabase query error:', error);
        throw error;
      }
      
      console.log('[ProfileStore] Profile data received:', data ? 'Yes' : 'No');
      
      if (data) {
        set({ profile: data as Profile });
        return data as Profile;
      } else {
        // Try to create a profile if it doesn't exist
        return await get().createProfileIfNotExists();
      }
    } catch (error: any) {
      console.error('[ProfileStore] fetchProfile error:', error);
      
      // Check if error is due to no profile found (PGRST116)
      if (error.code === 'PGRST116') {
        console.log('[ProfileStore] No profile found, attempting to create one');
        return await get().createProfileIfNotExists();
      }
      
      set({ error: error.message });
      toast.error('Failed to load profile');
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  createProfileIfNotExists: async () => {
    const userId = useAuthStore.getState().getUserId();
    console.log('[ProfileStore] createProfileIfNotExists - userId:', userId);
    
    if (!userId) {
      return null;
    }
    
    try {
      // Create default profile
      const defaultProfile: Omit<Profile, 'created_at' | 'updated_at'> = {
        id: userId,
        emergency_keywords: ['fire', 'help', 'emergency', 'police', 'ambulance'],
        sensitivity_level: 3,
        enable_flashlight: true,
        enable_vibration: true,
        enable_transcription: true,
        last_detection: null
      };
      
      console.log('[ProfileStore] Creating default profile');
      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single();
      
      if (error) {
        console.error('[ProfileStore] Create profile error:', error);
        throw error;
      }
      
      console.log('[ProfileStore] Default profile created:', data);
      set({ profile: data as Profile });
      return data as Profile;
    } catch (error: any) {
      console.error('[ProfileStore] createProfileIfNotExists error:', error);
      set({ error: error.message });
      toast.error('Failed to create profile');
      return null;
    }
  },
  
  updateProfile: async (data: Partial<Profile>) => {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      
      set(state => ({
        profile: state.profile ? { ...state.profile, ...data } : null
      }));
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      set({ error: error.message });
      toast.error('Failed to update profile');
    } finally {
      set({ loading: false });
    }
  },
  
  updateEmergencyKeywords: async (keywords: string[]) => {
    return get().updateProfile({ emergency_keywords: keywords });
  },
  
  updateSensitivityLevel: async (level: number) => {
    if (level < 1 || level > 5) {
      set({ error: 'Sensitivity level must be between 1 and 5' });
      toast.error('Invalid sensitivity level');
      return;
    }
    
    return get().updateProfile({ sensitivity_level: level });
  },
  
  toggleFlashlight: async (enabled: boolean) => {
    return get().updateProfile({ enable_flashlight: enabled });
  },
  
  toggleVibration: async (enabled: boolean) => {
    return get().updateProfile({ enable_vibration: enabled });
  },
  
  toggleTranscription: async (enabled: boolean) => {
    return get().updateProfile({ enable_transcription: enabled });
  }
}));