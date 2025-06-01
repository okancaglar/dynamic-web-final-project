// src/app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.replace('/flights');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-accent-teal" role="status">
                <span className="visually-hidden">Redirecting…</span>
            </div>
        </div>
    );
}