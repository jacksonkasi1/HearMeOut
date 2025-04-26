import React, { useState, createContext, PropsWithChildren, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/authStore';

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
                initialize()
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, [])

    useEffect(() => {
        if (!initialized || !appIsReady) return;
        if (session) {
            onLogin?.()
        } else if (!session) {
            onLogout?.()
        }
    }, [initialized, appIsReady, session]);

    if (!initialized || !appIsReady) {
        return null;
    }
    return <AuthContext.Provider value={{ session, initialized, user }}>{children}</AuthContext.Provider>
}