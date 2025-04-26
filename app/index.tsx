import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors } from '@/constants/colors';

export default function Index() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  
  useFocusEffect(
    useCallback(() => {
      if (!initialized) return;
      if (user) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, [initialized, user, router])
  );
  
  if (!initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});