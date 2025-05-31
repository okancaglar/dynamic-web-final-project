// src/app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    console.log("home page");
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Optionally verify via /auth/me, but for quick redirect, assume token exists → /flights
            router.replace('/flights');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
      <span className="spinner-border" role="status">
        <span className="visually-hidden">Redirecting…</span>
      </span>
        </div>
    );
}