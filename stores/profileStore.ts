import { create } from 'zustand';
import { supabase } from '@/supabase/client';
import { Profile } from '@/types';
import { useAuthStore } from './authStore';
import { toast } from '@/components/ui/Toast';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateEmergencyKeywords: (keywords: string[]) => Promise<void>;
  updateSensitivityLevel: (level: number) => Promise<void>;
  toggleFlashlight: (enabled: boolean) => Promise<void>;
  toggleVibration: (enabled: boolean) => Promise<void>;
  toggleTranscription: (enabled: boolean) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  
  fetchProfile: async () => {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      set({ profile: data as Profile });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load profile');
    } finally {
      set({ loading: false });
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
    } catch (error) {
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