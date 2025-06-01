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
                        <img src="/logo.png" alt="Logo" width="32" height="32" />
                        <span className="ms-2">Flight Ticket</span>
                    </Link>
                    <div className="ms-auto d-flex align-items-center">
                        {isAdmin && (
                            <button
                                className="btn-navbar"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                Admin Dashboard
                            </button>
                        )}
                        <button
                            className="btn-navbar"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Filter & Flights Grid ─────────────────────────────────────────── */}
            <div className="mt-4 mb-4 d-flex flex-column align-items-center">
                {error && <div className="alert alert-danger w-100">{error}</div>}

                <form
                    className="row g-3 justify-content-center align-items-end w-100"
                    onSubmit={handleFilterSubmit}
                    style={{ maxWidth: '720px' }}
                >
                    <div className="col-md-3">
                        <label htmlFor="origin" className="form-label">Origin</label>
                        <select
                            id="origin"
                            className="form-select"
                            value={filter.origin}
                            onChange={handleFilterChange('origin')}
                        >
                            <option value="">All</option>
                            {cities.map(c => (
                                <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="destination" className="form-label">Destination</label>
                        <select
                            id="destination"
                            className="form-select"
                            value={filter.destination}
                            onChange={handleFilterChange('destination')}
                        >
                            <option value="">All</option>
                            {cities.map(c => (
                                <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="date" className="form-label">Date</label>
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

            <div className="row row-symmetrical">
                {flights.length === 0 && !error && (
                    <div className="col-12 text-center">
                        <div className="alert alert-info">No flights found.</div>
                    </div>
                )}

                {flights.map(f => {
                    const fromCity = cities.find(c => c.city_id === f.from_city)?.city_name || f.from_city;
                    const toCity   = cities.find(c => c.city_id === f.to_city)?.city_name   || f.to_city;
                    return (
                        <div key={f.flight_id} className="col-sm-6 col-lg-4">
                            <div className="card card-custom h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-center">
                                        {fromCity} &rarr; {toCity}
                                    </h5>
                                    <div className="mb-3 text-center text-muted">
                                        <div>
                                            <small>Departure:</small><br/>
                                            {new Date(f.departure_time).toLocaleString()}
                                        </div>
                                        <div className="mt-2">
                                            <small>Arrival:</small><br/>
                                            {new Date(f.arrival_time).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="mt-auto text-center">
                                        <div className="h5 text-accent-teal mb-2">${f.price.toFixed(2)}</div>
                                        <div className="mb-3">
                                            <small>Seats: {f.seats_available}/{f.seats_total}</small>
                                        </div>
                                        <button
                                            className="btn-accent w-100"
                                            onClick={() => router.push(`/tickets/buy?flightId=${f.flight_id}`)}
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
        </>
    );
}