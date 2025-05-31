// src/app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [error, setError]           = useState('');
    const [successMessage, setSuccess] = useState('');
    const [busy, setBusy]             = useState(false);

    // If user already has a valid token, redirect to /flights immediately
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Optionally: verify token via /auth/me before redirecting
            fetch('http://localhost:3000/auth/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then((res) => {
                    if (res.ok) {
                        router.replace('/flights');
                    } else {
                        localStorage.removeItem('token');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                });
        }
    }, [router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setBusy(true);

        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const body = await res.json();

            if (!res.ok) {
                // backend returns 401 + { error: 'Invalid credentials' }
                const msg = body.error || 'Authentication failed';
                throw new Error(msg);
            }

            // On success: { token: '…' }
            const { token } = body;
            localStorage.setItem('token', token);

            // Show success message, then redirect after 1s
            setSuccess('Login successful! Redirecting to flights…');
            setTimeout(() => {
                console.log("inside set timeout");
                router.push('/flights');
                console.log("after push");
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="card shadow-sm" style={{ width: '380px' }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Login</h2>

                    {/* Show an error if login failed */}
                    {error && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Show success message if login succeeded */}
                    {!error && successMessage && (
                        <div className="alert alert-success mb-3" role="alert">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={busy || !!successMessage}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={busy || !!successMessage}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={busy || !!successMessage}
                        >
                            {busy ? 'Signing In…' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}