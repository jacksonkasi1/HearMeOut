import React, { useEffect } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
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
    
    const segments = useSegments();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    // Wait for navigation to be ready before rendering
    if (!navigationState?.key || !loaded) {
        return <ActivityIndicator />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider
                onLogout={() => { router.replace('/'); }} // redirect to login page
                onLogin={() => { router.replace('/'); }} // redirect to main page
            >
                <Toaster />
                <SafeAreaProvider>
                    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(app)" />
                        <Stack.Screen
                            name="+not-found"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                </SafeAreaProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
