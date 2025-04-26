import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/stores/profileStore';

export default function AppLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const { fetchProfile } = useProfileStore();
  
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    } else {
      // Fetch user profile when authenticated
      fetchProfile();
    }
  }, [user]);
  
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="keywords"
        options={{
          title: 'Emergency Keywords',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Emergency History',
          headerShown: true,
        }}
      />
    </Stack>
  );
}