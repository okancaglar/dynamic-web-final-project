// src/app/tickets/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TicketsPage() {
    const router = useRouter();

    const [loading, setLoading]  = useState(true);
    const [error, setError]      = useState('');
    const [tickets, setTickets]  = useState([]);

    // On mount: verify token, then fetch all tickets
    useEffect(() => {
        async function fetchTickets() {
            const token = localStorage.getItem('token');
            if (!token) {
                router.replace('/login');
                return;
            }

            // 1) Verify the token via /auth/me
            try {
                const meRes = await fetch('http://localhost:3000/auth/me', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!meRes.ok) {
                    localStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                localStorage.removeItem('token');
                router.replace('/login');
                return;
            }

            // 2) Fetch all tickets
            try {
                const res = await fetch('http://localhost:3000/tickets', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }
                const data = await res.json();
                setTickets(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch tickets:', err);
                setError('Failed to load tickets');
            } finally {
                setLoading(false);
            }
        }

        fetchTickets();
    }, [router]);

    // Logout button handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        router.replace('/login');
    };

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
            {/* ─── Title & “Back to Flights” ───────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Tickets</h2>
                <Link href="/flights" className="btn btn-outline-accent">
                    Back to Flights
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {tickets.length === 0 && !error ? (
                <div className="alert alert-info text-center">No tickets booked yet.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-custom">
                        <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Passenger</th>
                            <th>Email</th>
                            <th>Flight ID</th>
                            <th>Seat No.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tickets.map(t => (
                            <tr key={t.ticket_id}>
                                <td>{t.ticket_id}</td>
                                <td>{t.passenger_name} {t.passenger_surname}</td>
                                <td>{t.passenger_email}</td>
                                <td>{t.flight_id}</td>
                                <td>{t.seat_number || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

}