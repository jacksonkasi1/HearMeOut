import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: fonts.sizes.xs,
          fontWeight: fonts.weights.medium,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
        tabBarShowLabel: true,
        // Fix for Android to ensure proper padding
        ...(Platform.OS === 'android' && {
          tabBarStyle: {
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 0,
          }
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Listen',
          tabBarIcon: ({ color, size }) => (
            <Feather name="mic" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}