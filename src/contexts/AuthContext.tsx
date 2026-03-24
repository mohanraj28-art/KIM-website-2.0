'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string | null
    avatarUrl: string | null
    emailVerified: boolean
    mfaEnabled: boolean
    createdAt: string
    lastSignInAt: string | null
    permissions: string[]
}

export interface Tenant {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    role: string
}

interface AuthContextType {
    user: User | null
    tenant: Tenant | null // formerly organization
    isLoaded: boolean
    isSignedIn: boolean
    accessToken: string | null
    signIn: (email: string, password: string) => Promise<void>
    signUp: (data: SignUpData) => Promise<void>
    signOut: () => Promise<void>
    switchTenant: (tenantId: string) => void
    refreshUser: () => Promise<void>
    hasPermission: (permission: string) => boolean
}

interface SignUpData {
    email: string
    password: string
    firstName?: string
    lastName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_ACCOUNT_ID = 'default' // In production, resolve from domain

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    const refreshUser = useCallback(async () => {
        let token = localStorage.getItem('kaappu_token')

        // Check for non-httpOnly cookie set by OAuth callback
        if (!token && typeof document !== 'undefined') {
            const cookies = document.cookie.split('; ');
            const tokenCookie = cookies.find(c => c.startsWith('kaappu_token='));
            if (tokenCookie) {
                token = tokenCookie.split('=')[1]
                localStorage.setItem('kaappu_token', token)
                console.log('[Auth] Synced token from cookie to localStorage')
            }
        }

        if (!token) {
            console.log('[Auth] No token found in localStorage or cookies');
            setIsLoaded(true)
            return
        }

        try {
            console.log('[Auth] Attempting to refresh user with token...');
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                console.log('[Auth] User successfully refreshed:', data.data.user.email);
                setUser(data.data.user)
                setAccessToken(token)
                setTenant(data.data.tenant || null)
            } else {
                console.warn('[Auth] Session invalid or expired (401). Clearing tokens.');
                localStorage.removeItem('kaappu_token')
                localStorage.removeItem('kaappu_refresh_token')
                setUser(null)
                setAccessToken(null)
                setTenant(null)
            }
        } catch (err) {
            console.error('[Auth] Refresh user error:', err)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const signIn = async (email: string, password: string) => {
        console.log('[Auth] Signing in user:', email);
        const res = await fetch('/api/auth/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, accountId: DEFAULT_ACCOUNT_ID }),
        })
        const data = await res.json()
        if (!res.ok) {
            console.error('[Auth] Sign-in failed:', data.error);
            throw new Error(data.error)
        }

        console.log('[Auth] Sign-in successful!');
        localStorage.setItem('kaappu_token', data.data.accessToken)
        localStorage.setItem('kaappu_refresh_token', data.data.refreshToken)
        setUser(data.data.user)
        setAccessToken(data.data.accessToken)
        setTenant(data.data.tenant || null)
    }

    const signUp = async (formData: SignUpData) => {
        const res = await fetch('/api/auth/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, accountId: DEFAULT_ACCOUNT_ID }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        localStorage.setItem('kaappu_token', data.data.accessToken)
        localStorage.setItem('kaappu_refresh_token', data.data.refreshToken)
        setUser(data.data.user)
        setAccessToken(data.data.accessToken)
    }

    const signOut = async () => {
        const token = localStorage.getItem('kaappu_token')
        if (token) {
            await fetch('/api/auth/sign-out', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => { })
        }
        localStorage.removeItem('kaappu_token')
        localStorage.removeItem('kaappu_refresh_token')

        if (typeof document !== 'undefined') {
            document.cookie = 'kaappu_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }

        setUser(null)
        setAccessToken(null)
        setTenant(null)
    }

    const switchTenant = (tenantId: string) => {
        // Fetch tenant info and set
        fetch(`/api/tenants/${tenantId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(r => r.json())
            .then(data => setTenant(data.data))
            .catch(() => { })
    }

    const hasPermission = useCallback((permission: string) => {
        if (!user || (!user.permissions && !Array.isArray(user.permissions))) return false;
        return user.permissions.includes('*') || user.permissions.includes(permission);
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            tenant,
            isLoaded,
            isSignedIn: !!user,
            accessToken,
            signIn,
            signUp,
            signOut,
            switchTenant,
            refreshUser,
            hasPermission,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
