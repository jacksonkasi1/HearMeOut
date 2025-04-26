import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '@/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string, options?: { metadata?: any }) => Promise<void>
    updateUserProfile: (data: { username?: string, avatar_url?: string, [key: string]: any }) => Promise<void>
    getUserId: () => string | null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            loading: false,
            initialized: false,

            initialize: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    set({ session, user: session?.user || null, initialized: true });
                    supabase.auth.onAuthStateChange((_event, session) => {
                        set({ session, user: session?.user || null });
                    });
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    set({ initialized: true });
                }
            },

            signInWithEmail: async (email, password) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    set({ user: data.user, session: data.session });
                    toast.success('Signed in successfully');
                } catch (error: any) {
                    toast.error(`Error signing in: ${error.message}`);
                } finally { set({ loading: false }); }
            },

            signUpWithEmail: async (email, password, metadata) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase.auth.signUp({ email, password, options: metadata ? { data: metadata } : undefined });
                    if (error) throw error;
                    toast.success('Signed up successfully, please verify your email.');
                } catch (error: any) {
                    toast.error(`Error signing up: ${error.message}`);
                } finally { set({ loading: false }); }
            },

            signOut: async () => {
                set({ loading: true });
                try {
                    await supabase.auth.signOut();
                    set({ user: null, session: null });
                    toast.success('Signed out successfully');
                } catch (error: any) {
                    toast.error(`Error signing out: ${error.message}`);
                } finally { set({ loading: false }); }
            },

            updateUserProfile: async (userData: { username?: string, avatar_url?: string, [key: string]: any }) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase.auth.updateUser({ data: userData });
                    if (error) throw error;
                    set({ user: data.user });
                    toast.success('Profile updated successfully');
                } catch (error: any) {
                    toast.error(`Error updating profile: ${error.message}`);
                } finally { set({ loading: false }); }
            },

            getUserId: () => get().user?.id || null,
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
