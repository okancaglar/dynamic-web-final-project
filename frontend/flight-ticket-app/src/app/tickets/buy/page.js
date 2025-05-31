// src/app/tickets/buy/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BuyTicketPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const flightId = searchParams.get('flightId') || '';

    const [loading, setLoading]        = useState(true);
    const [error, setError]            = useState('');
    const [successMessage, setSuccess] = useState('');
    const [formData, setFormData]      = useState({
        passenger_name: '',
        passenger_surname: '',
        passenger_email: '',
        seat_number: ''
    });

    // 1) On mount: verify token and ensure flightId is present
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

        // Verify token
        fetch('http://localhost:3000/auth/me', {
            method: 'GET',
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
            .catch((err) => {
                console.error('Auth check failed:', err);
                localStorage.removeItem('token');
                router.replace('/login');
            });
    }, [flightId, router]);

    // Handle form field changes
    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
            return;
        }

        const payload = {
            passenger_name:    formData.passenger_name,
            passenger_surname: formData.passenger_surname,
            passenger_email:   formData.passenger_email,
            flight_id:         Number(flightId),
            seat_id:      Number(formData.seat_number)
        };

        try {
            const res = await fetch('http://localhost:3000/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const body = await res.json();
            if (!res.ok) {
                // Example: { error: 'Flight not found' } or validation errors
                const msg = body.error || 'Failed to create ticket.';
                throw new Error(msg);
            }

            // Success: backend returns the inserted ticket row
            setSuccess('Ticket purchased successfully! Redirecting to your tickets…');
            setTimeout(() => {
                router.push('/tickets');
            }, 1000);

        } catch (err) {
            console.error('Ticket creation failed:', err);
            setError(err.message);
        }
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
        <span className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </span>
            </div>
        );
    }

    return (
        <>
            {/* ─── Navbar ─────────────────────────────────────────────── */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link href="/" className="navbar-brand">
                        Flight Ticket
                    </Link>
                    <div>
                        <Link href="/tickets">
                            <button className="btn btn-outline-secondary">My Tickets</button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container mt-4" style={{ maxWidth: '480px' }}>
                <h1 className="mb-4">Buy Ticket (Flight #{flightId})</h1>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="passenger_name" className="form-label">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="passenger_name"
                            className="form-control"
                            value={formData.passenger_name}
                            onChange={handleChange('passenger_name')}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="passenger_surname" className="form-label">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="passenger_surname"
                            className="form-control"
                            value={formData.passenger_surname}
                            onChange={handleChange('passenger_surname')}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="passenger_email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="passenger_email"
                            className="form-control"
                            value={formData.passenger_email}
                            onChange={handleChange('passenger_email')}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="seat_number" className="form-label">
                            Seat Number (optional)
                        </label>
                        <input
                            type="text"
                            id="seat_number"
                            className="form-control"
                            value={formData.seat_number}
                            onChange={handleChange('seat_number')}
                            placeholder="e.g. 12A"
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100">
                        Purchase Ticket
                    </button>
                </form>
            </div>
        </>
    );
}