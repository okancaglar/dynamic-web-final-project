// src/app/flights/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function FlightsPage() {
    const router = useRouter();

    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [cities, setCities]       = useState([]);
    const [flights, setFlights]     = useState([]);
    const [filter, setFilter]       = useState({
        origin: '',
        destination: '',
        date: ''
    });
    const [isAdmin, setIsAdmin]     = useState(false);

    // On mount, verify token and fetch cities + flights
    useEffect(() => {
        async function init() {
            const token = localStorage.getItem('token');
            if (!token) {
                router.replace('/login');
                return;
            }

            // 1) Verify /auth/me
            try {
                const meRes = await fetch('http://localhost:3000/auth/me', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!meRes.ok) {
                    localStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }
                const { isAdmin: adminFlag } = await meRes.json();
                setIsAdmin(adminFlag);
            } catch (err) {
                console.error('Auth check failed:', err);
                localStorage.removeItem('token');
                router.replace('/login');
                return;
            }

            // 2) Fetch and sort cities
            try {
                const cRes = await fetch('http://localhost:3000/cities/all', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (cRes.status === 401) {
                    localStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }
                const cData = await cRes.json();
                // Explicitly sort by city_name ascending
                const sorted = Array.isArray(cData)
                    ? cData.slice().sort((a, b) =>
                        a.city_name.localeCompare(b.city_name)
                    )
                    : [];
                setCities(sorted);
            } catch (err) {
                console.error('Cities fetch failed:', err);
                setError('Failed to load cities');
            }

            // 3) Fetch all flights
            try {
                const fRes = await fetch('http://localhost:3000/flights', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (fRes.status === 401) {
                    localStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }
                const fData = await fRes.json();
                setFlights(Array.isArray(fData) ? fData : []);
            } catch (err) {
                console.error('Flights fetch failed:', err);
                setError('Failed to load flights');
            }

            setLoading(false);
        }

        init();
    }, [router]);

    // Logout
    function handleLogout() {
        localStorage.removeItem('token');
        router.replace('/login');
    }

    // Handle filter input changes
    const handleFilterChange = (field) => (e) => {
        setFilter((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Submit filter: fetch filtered flights
    async function handleFilterSubmit(e) {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
            return;
        }

        const params = new URLSearchParams();
        if (filter.origin)      params.append('origin', filter.origin);
        if (filter.destination) params.append('destination', filter.destination);
        if (filter.date)        params.append('date', filter.date);

        try {
            const res = await fetch(
                `http://localhost:3000/flights/filter?${params.toString()}`,
                {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (res.status === 401) {
                localStorage.removeItem('token');
                router.replace('/login');
                return;
            }
            const data = await res.json();
            setFlights(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Filter fetch failed:', err);
            setError('Filter request failed');
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
            {/* ─── Navbar for Flights Page ────────────────────────────────────────── */}
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
                    <div className="ms-auto d-flex align-items-center">
                        {isAdmin && (
                            <button
                                className="btn-navbar me-2"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                Admin Dashboard
                            </button>
                        )}
                        <button className="btn-navbar" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Filter & Flights Grid ─────────────────────────────────────────── */}
            <div className="flights-background">
                <div className="mt-4 mb-4 d-flex flex-column align-items-center">
                    {error && <div className="alert alert-danger w-100">{error}</div>}

                    <form
                        className="row g-3 justify-content-center align-items-end w-100"
                        onSubmit={handleFilterSubmit}
                        style={{ maxWidth: '720px' }}
                    >
                        <div className="col-md-3">
                            <label htmlFor="origin" className="form-label">
                                Origin
                            </label>
                            <select
                                id="origin"
                                className="form-select"
                                value={filter.origin}
                                onChange={handleFilterChange('origin')}
                            >
                                <option value="">All</option>
                                {cities.map((c) => (
                                    <option key={c.city_id} value={c.city_id}>
                                        {c.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="destination" className="form-label">
                                Destination
                            </label>
                            <select
                                id="destination"
                                className="form-select"
                                value={filter.destination}
                                onChange={handleFilterChange('destination')}
                            >
                                <option value="">All</option>
                                {cities.map((c) => (
                                    <option key={c.city_id} value={c.city_id}>
                                        {c.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="date" className="form-label">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                className="form-control"
                                value={filter.date}
                                onChange={handleFilterChange('date')}
                            />
                        </div>
                        <div className="col-md-2 d-grid">
                            <button className="btn-accent" type="submit">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                <div className="container">
                    <div className="row row-symmetrical">
                        {flights.length === 0 && !error && (
                            <div className="col-12 text-center">
                                <div className="alert alert-info">No flights found.</div>
                            </div>
                        )}

                        {flights.map((f) => {
                            const fromCity =
                                cities.find((c) => c.city_id === f.from_city)?.city_name ||
                                f.from_city;
                            const toCity =
                                cities.find((c) => c.city_id === f.to_city)?.city_name ||
                                f.to_city;
                            return (
                                <div key={f.flight_id} className="col-sm-6 col-lg-4 mb-4">
                                    <div className="card card-custom h-100">
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title text-center">
                                                {fromCity} &rarr; {toCity}
                                            </h5>
                                            <div className="mb-3 text-center text-muted">
                                                <div>
                                                    <small>Departure:</small>
                                                    <br />
                                                    {new Date(f.departure_time).toLocaleString()}
                                                </div>
                                                <div className="mt-2">
                                                    <small>Arrival:</small>
                                                    <br />
                                                    {new Date(f.arrival_time).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="mt-auto text-center">
                                                <div className="h5 text-accent-teal mb-2">
                                                    ₺{f.price.toFixed(2)}
                                                </div>
                                                <div className="mb-3">
                                                    <small>
                                                        Seats: {f.seats_available}/{f.seats_total}
                                                    </small>
                                                </div>
                                                <button
                                                    className="btn-accent w-100"
                                                    onClick={() =>
                                                        router.push(
                                                            `/tickets/buy?flight_id=${f.flight_id}`
                                                        )
                                                    }
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── STYLED-JSX FOR CUSTOM CSS ────────────────────────────────────────── */}
            <style jsx>{`
        /* Full-page gradient background */
        .flights-background {
          min-height: calc(100vh - 70px); /* subtract navbar height */
          width: 100%;
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          padding-top: 1rem;
          padding-bottom: 2rem;
        }

        /* Navbar customizations */
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

        /* Card (flight card) customizations */
        .card-custom {
          background: #ffffff;
          border-radius: 0.75rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          border: none;
        }

        /* Accent button for “Search” & “Book Now” */
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

        /* Accent text color for price */
        .text-accent-teal {
          color: #2ac2c2 !important;
        }

        /* Spacing between rows of cards */
        .row-symmetrical {
          margin-left: -1rem;
          margin-right: -1rem;
        }
        .row-symmetrical > .col-sm-6,
        .row-symmetrical > .col-lg-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
      `}</style>
        </>
    );
}