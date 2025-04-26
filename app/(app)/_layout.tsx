import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';

export default function AppLayout() {
  const { user, initialized } = useAuth();
  const { fetchProfile } = useProfileStore();
  
  useEffect(() => {
    if (user) {
      // Fetch user profile when authenticated
      fetchProfile();
    }
  }, [user]);
  
  // Direct redirect if no user (instead of programmatic navigation)
  if (initialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }
  
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