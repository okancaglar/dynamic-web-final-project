// src/context/AuthContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    email: null,
    loading: true,
    login: async (email, password) => {},
    logout: () => {},
    refresh: async () => {}
});

export function AuthProvider({ children }) {
    const [token, setToken]               = useState(null);
    const [isAuthenticated, setIsAuth]    = useState(false);
    const [isAdmin, setIsAdmin]           = useState(false);
    const [email, setEmail]               = useState(null);
    const [loading, setLoading]           = useState(true);

    // On mount, read token from localStorage (if present) and validate it:
    useEffect(() => {
        async function initAuth() {
            const stored = localStorage.getItem('token');
            if (stored) {
                // Try verifying via /auth/me
                try {
                    const meRes = await fetch('http://localhost:3000/auth/me', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${stored}`
                        }
                    });
                    if (meRes.ok) {
                        const data = await meRes.json(); // { email, isAdmin }
                        setToken(stored);
                        setIsAuth(true);
                        setIsAdmin(data.isAdmin);
                        setEmail(data.email);
                    } else {
                        // invalid/expired
                        localStorage.removeItem('token');
                        setToken(null);
                        setIsAuth(false);
                        setIsAdmin(false);
                        setEmail(null);
                    }
                } catch (err) {
                    console.error('AuthProvider initAuth error:', err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        }
        initAuth();
    }, []);

    // login(email,password): calls /auth/login, stores token, then calls /auth/me
    const login = async (emailInput, passwordInput) => {
        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput, password: passwordInput })
        });
        if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error || 'Login failed');
        }
        const { token: newToken } = await res.json();
        // Store token
        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Fetch /auth/me to get isAdmin & email
        const meRes = await fetch('http://localhost:3000/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${newToken}`
            }
        });
        if (!meRes.ok) {
            // token somehow invalid—clear and fail
            localStorage.removeItem('token');
            setToken(null);
            setIsAuth(false);
            setIsAdmin(false);
            setEmail(null);
            throw new Error('Invalid token');
        }
        const data = await meRes.json();
        setIsAuth(true);
        setIsAdmin(data.isAdmin);
        setEmail(data.email);
    };

    // logout(): clears token from localStorage & reset state
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuth(false);
        setIsAdmin(false);
        setEmail(null);
    };

    // refresh(): re-validate token if present
    const refresh = async () => {
        setLoading(true);
        const stored = localStorage.getItem('token');
        if (stored) {
            try {
                const meRes = await fetch('http://localhost:3000/auth/me', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${stored}` }
                });
                if (meRes.ok) {
                    const data = await meRes.json();
                    setToken(stored);
                    setIsAuth(true);
                    setIsAdmin(data.isAdmin);
                    setEmail(data.email);
                } else {
                    localStorage.removeItem('token');
                    setToken(null);
                    setIsAuth(false);
                    setIsAdmin(false);
                    setEmail(null);
                }
            } catch (err) {
                console.error('AuthProvider refresh error:', err);
                localStorage.removeItem('token');
                setToken(null);
                setIsAuth(false);
                setIsAdmin(false);
                setEmail(null);
            }
        } else {
            setIsAuth(false);
            setIsAdmin(false);
            setEmail(null);
        }
        setLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated,
                isAdmin,
                email,
                loading,
                login,
                logout,
                refresh
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}