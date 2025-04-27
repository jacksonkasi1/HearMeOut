import React, { useState, createContext, PropsWithChildren, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/authStore';
import { ActivityIndicator, View, Platform, PermissionsAndroid } from 'react-native';
import { colors } from '@/constants/colors';

type AuthProps = {
    user: User | null
    session: Session | null
    initialized: boolean
}

export const AuthContext = createContext({} as AuthProps)

export const AuthProvider = ({ children, onLogout, onLogin }: PropsWithChildren<{ onLogout?: () => void, onLogin?: () => void }>) => {
    const { user, session, initialized, initialize } = useAuthStore();
    const [appIsReady, setAppIsReady] = useState<boolean>(false);

    // Request Android permissions if needed
    const requestAndroidPermissions = async () => {
        if (Platform.OS !== 'android') return;
        
        try {
            console.log('Requesting Android vibration permission');
            // Vibration doesn't actually need runtime permission on Android 6.0+
            // but we'll try to ensure it's explicitly granted
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.VIBRATE,
                {
                    title: "Vibration Permission",
                    message: "HearMeOut needs vibration permission for emergency alerts",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            console.log(`Vibration permission status: ${granted}`);
        } catch (err) {
            console.warn('Error requesting vibration permission:', err);
        }
    };

    useEffect(() => {
        async function prepare() {
            try {
                // Request permissions first
                await requestAndroidPermissions();
                
                // Then initialize auth
                await initialize();
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, [])

    useEffect(() => {
        if (!initialized || !appIsReady) return;
        
        if (session && user) {
            onLogin?.()
        } else {
            onLogout?.()
        }
    }, [initialized, appIsReady, session, user]);

    if (!initialized || !appIsReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }
    
    return <AuthContext.Provider value={{ session, initialized, user }}>{children}</AuthContext.Provider>
}