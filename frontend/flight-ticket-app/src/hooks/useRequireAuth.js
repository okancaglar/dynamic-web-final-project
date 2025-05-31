// src/hooks/useRequireAuth.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to protect a client component/page. Usage:
 *
 *   function ProtectedPage() {
 *     useRequireAuth();
 *     return <div>…</div>;
 *   }
 *
 * It will redirect to /login if:
 *   - loading is finished AND isAuthenticated is false, OR
 *   - The call to /auth/me returned 401 (handled in AuthProvider).
 */
export default function useRequireAuth() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log("inside useRequiteAuth");
            router.replace('/login');
        }
    }, [loading, isAuthenticated, router]);
}