import React, { useEffect } from 'react';
import { Slot, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/provider/AuthProvider';
import { Toaster } from '@/components/ui/Toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <StatusBar style="dark" />
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <AuthProvider
                onLogout={() => { router.replace('/(auth)/login'); }}
                onLogin={() => { router.replace('/(app)/(tabs)'); }}
            >
                <Toaster />
                <SafeAreaProvider>
                    <Slot />
                </SafeAreaProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
