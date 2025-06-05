// src/app/register/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";


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
        <>
            {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
            <nav className="navbar navbar-expand-lg navbar-custom">
                <div className="container container-centered">
                    <Link href="/" className="navbar-brand d-flex align-items-center">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2.5 19.5L12 10L21.5 19.5L12 14V2L2.5 11.5L8.5 13L2.5 19.5Z"
                                fill="#2AC2C2"
                            />
                        </svg>
                        <span className="ms-2 navbar-title">Flight Ticket</span>
                    </Link>
                    <div className="ms-auto">
                        <button
                            className="btn btn-outline-accent btn-sm"
                            onClick={() => router.push('/login')}
                            disabled={busy || !!successMessage}
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Registration Form ───────────────────────────────────────────────── */}
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #2ac2c2 0%, #007bff 100%)' }}
            >
                <div className="card card-custom p-4" style={{ width: '100%', maxWidth: '380px' }}>
                    <h2 className="text-center mb-3 text-accent-teal">Create Account</h2>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    {!error && successMessage && (
                        <div className="alert alert-success" role="alert">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
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
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
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

            {/* ─── STYLED‐JSX FOR CUSTOM CSS ────────────────────────────────────────── */}
            <style jsx>{`
        .navbar-custom {
          background: #ffffffee;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: 70px;
        }
        .container-centered {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }
        .navbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2ac2c2;
        }

        .card-custom {
          background: #ffffff;
          border-radius: 0.75rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          border: none;
        }

        .btn-accent {
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          color: #fff;
          border: none;
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: background 0.3s ease;
        }
        .btn-accent:hover {
          background: linear-gradient(135deg, #25aaa8 0%, #0069d9 100%);
        }

        .btn-outline-accent {
          color: #2ac2c2;
          border: 2px solid #2ac2c2;
          background: transparent;
          border-radius: 0.5rem;
          padding: 0.375rem 0.75rem;
          transition: all 0.3s ease;
        }
        .btn-outline-accent:hover {
          background: #2ac2c2;
          color: #fff;
          border-color: #2ac2c2;
        }

        .text-accent-teal {
          color: #2ac2c2 !important;
        }
      `}</style>
        </>
    );}