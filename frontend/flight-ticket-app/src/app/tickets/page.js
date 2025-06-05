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
                            onClick={() => {
                                localStorage.removeItem('token');
                                router.replace('/login');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Page Content ──────────────────────────────────────────────────── */}
            <div className="mytickets-background p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-white">My Tickets</h2>
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
                            {tickets.map((t) => (
                                <tr key={t.ticket_id}>
                                    <td>{t.ticket_id}</td>
                                    <td>
                                        {t.passenger_name} {t.passenger_surname}
                                    </td>
                                    <td>{t.passenger_email}</td>
                                    <td>{t.flight_id}</td>
                                    <td>{t.seat_number || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
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

        .mytickets-background {
          min-height: calc(100vh - 70px);
          width: 100%;
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          padding-top: 2rem;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .text-accent-teal {
          color: #2ac2c2 !important;
        }

        .table-custom thead {
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          color: #fff;
        }
        .table-custom th,
        .table-custom td {
          vertical-align: middle;
        }
      `}</style>
        </>
    );

}