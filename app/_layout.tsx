import React, { useEffect } from 'react';
import { Slot, Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/provider/AuthProvider';
import { Toaster } from '@/components/ui/Toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
        return <ActivityIndicator />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
