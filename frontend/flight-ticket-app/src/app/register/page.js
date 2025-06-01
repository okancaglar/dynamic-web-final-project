// src/app/register/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [successMessage, setSuccess] = useState('');
    const [busy, setBusy]         = useState(false);

    // If the user is already logged in (token exists), send them to /flights
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.replace('/flights');
        }
    }, [router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setBusy(true);

        try {
            // 1) POST to backend /auth/register with isAdmin=0
            const res = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    isAdmin: 0   // force normal user
                })
            });

            const body = await res.json();
            if (!res.ok) {
                // e.g. { error: 'Email already exists' }
                const msg = body.error || 'Registration failed';
                throw new Error(msg);
            }

            // 2) On success: show a message then redirect to /login
            setSuccess('Registration successful! Redirecting to login…');
            setTimeout(() => {
                router.push('/login');
            }, 1000);

        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card card-custom p-4" style={{ width: '100%', maxWidth: '380px' }}>
                <h2 className="text-center mb-3">Create Account</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {!error && successMessage && <div className="alert alert-success">{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                            onChange={e => setPassword(e.target.value)}
                            disabled={busy || !!successMessage}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-accent w-100 mb-3"
                        disabled={busy || !!successMessage}
                    >
                        {busy ? 'Please wait…' : 'Register'}
                    </button>
                </form>

                <div className="text-center">
                    <span>Already have an account? </span>
                    <button
                        className="btn btn-link p-0"
                        onClick={() => router.push('/login')}
                        disabled={busy || !!successMessage}
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
}