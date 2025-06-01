// src/app/tickets/buy/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BuyTicketPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const flightId = searchParams.get('flightId');

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
                        <label htmlFor="passenger_name" className="form-label">First Name</label>
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
                        <label htmlFor="passenger_surname" className="form-label">Last Name</label>
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
                        <label htmlFor="passenger_email" className="form-label">Email</label>
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
                        <label htmlFor="seat_number" className="form-label">Seat Number</label>
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
                        <button className="btn-outline-teal">
                            Back to Flights
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}