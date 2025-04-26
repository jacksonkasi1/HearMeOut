import { create } from 'zustand';
import { supabase } from '@/supabase/client';
import { EmergencyLog } from '@/types';
import { useAuthStore } from './authStore';
import { toast } from '@/components/ui/Toast';

interface EmergencyLogsState {
  logs: EmergencyLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  addLog: (log: Omit<EmergencyLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  clearLogs: () => Promise<void>;
}

export const useEmergencyLogsStore = create<EmergencyLogsState>((set) => ({
  logs: [],
  loading: false,
  error: null,
  
  fetchLogs: async () => {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('emergency_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ logs: data as EmergencyLog[] });
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to load emergency logs');
    } finally {
      set({ loading: false });
    }
  },
  
  addLog: async (log) => {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('emergency_logs')
        .insert({
          user_id: userId,
          ...log
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ logs: [data as EmergencyLog, ...state.logs] }));
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to add emergency log');
    } finally {
      set({ loading: false });
    }
  },
  
  clearLogs: async () => {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('emergency_logs')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set({ logs: [] });
      toast.success('Emergency logs cleared');
    } catch (error) {
      set({ error: error.message });
      toast.error('Failed to clear emergency logs');
    } finally {
      set({ loading: false });
    }
  }
}));