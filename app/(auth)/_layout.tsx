import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { user, initialized } = useAuth();
  
  // Redirect to app if user is already authenticated
  if (initialized && user) {
    return <Redirect href="/(app)/(tabs)" />;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
} 