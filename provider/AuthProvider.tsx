import React, { useState, createContext, PropsWithChildren, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/authStore';
import { ActivityIndicator, View } from 'react-native';
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

    useEffect(() => {
        async function prepare() {
            try {
                await initialize()
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