import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { View } from 'react-native';

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}>
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
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Emergency History',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
    </View>
  );
}