// src/app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


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
        <>
            {/* ─── LOGIN PAGE NAVBAR ────────────────────────────────────────────────── */}
            <nav className="navbar navbar-expand-lg navbar-custom">
                <div className="container container-centered">
                    <Link href="/" className="navbar-brand d-flex align-items-center">
                        {/* Flight Logo */}
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
                        <Link href="/register" className="nav-button">
                            <button className="btn-navbar">Register</button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── LOGIN FORM (on gradient background) ───────────────────────────────── */}
            <div className="login-background d-flex justify-content-center align-items-center">
                <div className="card card-custom p-4">
                    <h2 className="text-center mb-3">Log In</h2>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {!error && successMessage && (
                        <div className="alert alert-success">{successMessage}</div>
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
                            className="btn-accent w-100 mb-3"
                            disabled={busy || !!successMessage}
                        >
                            {busy ? 'Please wait…' : 'Log In'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ─── STYLED-JSX FOR CUSTOM CSS ────────────────────────────────────────── */}
            <style jsx>{`
        /* Full-page gradient background */
        .login-background {
          min-height: 75vh;
          width: 100%;
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
        }

        /* Navbar customizations */
        .navbar-custom {
          background: #ffffffee;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
        .btn-navbar {
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          border: none;
          color: #fff;
          padding: 0.375rem 0.75rem;
          border-radius: 0.25rem;
          transition: background 0.3s ease;
        }
        .btn-navbar:hover {
          background: linear-gradient(135deg, #25aaa8 0%, #0069d9 100%);
        }

        /* Card (login form box) customizations */
        .card-custom {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border-radius: 0.75rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        /* Accent button for “Log In” */
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
      `}</style>
        </>
    ); (
        <>
            {/* ─── LOGIN PAGE NAVBAR ────────────────────────────────────────────────── */}
            <nav className="navbar navbar-expand-lg navbar-custom">
                <div className="container container-centered">
                    <Link href="/" className="navbar-brand d-flex align-items-center">
                        {/* If your logo is dark, you may need to invert its colors in CSS */}
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
                        <span className="ms-2">Flight Ticket</span>
                    </Link>
                    <div className="ms-auto">
                        <Link href="/register" className="nav-button">
                            <button className="btn-navbar">Register</button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── LOGIN FORM (on light gray-blue background, card still white) ───────────────────────── */}
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
                <div className="card card-custom p-4" style={{ width: '100%', maxWidth: '380px' }}>
                    <h2 className="text-center mb-3">Log In</h2>

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
                            className="btn-accent w-100 mb-3"
                            disabled={busy || !!successMessage}
                        >
                            {busy ? 'Please wait…' : 'Log In'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}