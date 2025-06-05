// src/app/tickets/buy/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BuyTicketPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const flightId = searchParams.get('flight_id');

    const [loading, setLoading]        = useState(true);
    const [error, setError]            = useState('');
    const [successMessage, setSuccess] = useState('');
    const [busy, setBusy]              = useState(false);
    const [formData, setFormData]      = useState({
        passenger_name:    '',
        passenger_surname: '',
        passenger_email:   '',
        seat_number:       ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
            return;
        }
        if (!flightId) {
            setError('No flight selected.');
            setLoading(false);
            return;
        }
        // Verify token by calling /auth/me
        fetch('http://localhost:3000/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                if (!res.ok) {
                    localStorage.removeItem('token');
                    router.replace('/login');
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                router.replace('/login');
            });
    }, [flightId, router]);

    function handleChange(field) {
        return (e) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setBusy(true);

        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
            return;
        }

        const payload = {
            passenger_name:    formData.passenger_name.trim(),
            passenger_surname: formData.passenger_surname.trim(),
            passenger_email:   formData.passenger_email.trim(),
            flight_id:         Number(flightId),
            seat_number:       Number(formData.seat_number.trim())
        };

        try {
            const res = await fetch('http://localhost:3000/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.error || 'Booking failed');
            }
            setSuccess('Ticket booked successfully! Redirecting to My Tickets…');
            setTimeout(() => {
                router.replace('/tickets');
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-accent-teal" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
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
                        <Link href="/flights" className="btn btn-outline-accent">
                            Back to Flights
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Booking Form ───────────────────────────────────────────────────── */}
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="card card-custom p-4" style={{ width: '100%', maxWidth: '480px' }}>
                    <h2 className="text-center mb-3">Book Flight #{flightId}</h2>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Success Alert */}
                    {!error && successMessage && (
                        <div className="alert alert-success mb-3" role="alert">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="passenger_name" className="form-label">
                                First Name
                            </label>
                            <input
                                id="passenger_name"
                                type="text"
                                className="form-control"
                                value={formData.passenger_name}
                                onChange={handleChange('passenger_name')}
                                disabled={busy || !!successMessage}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="passenger_surname" className="form-label">
                                Last Name
                            </label>
                            <input
                                id="passenger_surname"
                                type="text"
                                className="form-control"
                                value={formData.passenger_surname}
                                onChange={handleChange('passenger_surname')}
                                disabled={busy || !!successMessage}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="passenger_email" className="form-label">
                                Email
                            </label>
                            <input
                                id="passenger_email"
                                type="email"
                                className="form-control"
                                value={formData.passenger_email}
                                onChange={handleChange('passenger_email')}
                                disabled={busy || !!successMessage}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="seat_number" className="form-label">
                                Seat Number
                            </label>
                            <input
                                id="seat_number"
                                type="text"
                                className="form-control"
                                value={formData.seat_number}
                                onChange={handleChange('seat_number')}
                                disabled={busy || !!successMessage}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-accent w-100"
                            disabled={busy || !!successMessage}
                        >
                            {busy ? 'Booking…' : 'Confirm Booking'}
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <Link href="/flights" className="text-decoration-none">
                            <button className="btn-outline-teal">Back to Flights</button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ─── STYLED‐JSX FOR CUSTOM CSS ────────────────────────────────────────── */}
            <style jsx>{`
        /* Gradient background behind navbar and form */
        body {
          margin: 0;
        }
        .d-flex {
          /* ensure wrapper spans full width */
          width: 100%;
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
        }

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

        .btn-outline-teal {
          color: #2ac2c2;
          border: 2px solid #2ac2c2;
          background: transparent;
          border-radius: 0.5rem;
          padding: 0.375rem 0.75rem;
          transition: all 0.3s ease;
        }
        .btn-outline-teal:hover {
          background: #2ac2c2;
          color: #fff;
          border-color: #2ac2c2;
        }

        .text-accent-teal {
          color: #2ac2c2 !important;
        }
      `}</style>
        </>
    );
}