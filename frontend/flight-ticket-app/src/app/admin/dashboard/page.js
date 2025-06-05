// src/app/admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();

    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [cities, setCities]     = useState([]);
    const [tickets, setTickets]   = useState([]);
    const [ticketError, setTicketError] = useState('');

    // Form states
    const [createData, setCreateData] = useState({
        from_city: '',
        to_city: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        seats_total: '',
        seats_available: ''
    });
    const [updateData, setUpdateData] = useState({
        flight_id: '',
        from_city: '',
        to_city: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        seats_total: '',
        seats_available: ''
    });
    const [deleteId, setDeleteId] = useState('');

    // Success messages
    const [createMsg, setCreateMsg] = useState('');
    const [updateMsg, setUpdateMsg] = useState('');
    const [deleteMsg, setDeleteMsg] = useState('');

    // Fetch cities & tickets once on mount
    useEffect(() => {
        async function init() {
            const token = localStorage.getItem('token');
            if (!token) {
                router.replace('/login');
                return;
            }

            // Fetch cities
            try {
                const cRes = await fetch('http://localhost:3000/cities/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!cRes.ok) throw new Error('Failed to load cities');
                const cData = await cRes.json();
                const sorted = Array.isArray(cData)
                    ? cData.slice().sort((a, b) => a.city_name.localeCompare(b.city_name))
                    : [];
                setCities(sorted);
            } catch (err) {
                console.error(err);
                setError('Could not fetch cities');
            }

            // Fetch tickets
            try {
                const tRes = await fetch('http://localhost:3000/tickets', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!tRes.ok) throw new Error('Failed to load tickets');
                const tData = await tRes.json();
                setTickets(Array.isArray(tData) ? tData : []);
            } catch (err) {
                console.error(err);
                setTicketError('Could not fetch tickets');
            }

            setLoading(false);
        }

        init();
    }, [router]);

    // Handlers for form fields
    const handleCreateChange = (field) => (e) => {
        setCreateData((prev) => ({ ...prev, [field]: e.target.value }));
    };
    const handleUpdateChange = (field) => (e) => {
        setUpdateData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Create Flight
    async function handleCreate(e) {
        e.preventDefault();
        setError('');
        setCreateMsg('');
        const token = localStorage.getItem('token');
        if (!token) return router.replace('/login');

        const payload = {
            from_city:        Number(createData.from_city),
            to_city:          Number(createData.to_city),
            departure_time:   createData.departure_time,
            arrival_time:     createData.arrival_time,
            price:            parseFloat(createData.price),
            seats_total:      parseInt(createData.seats_total, 10),
            seats_available:  parseInt(createData.seats_total, 10)
        };

        try {
            const res = await fetch('http://localhost:3000/flights', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || 'Create failed');
            }
            const data = await res.json();
            setCreateMsg(`Flight #${data.flight_id} created`);
            setCreateData({
                from_city: '',
                to_city: '',
                departure_time: '',
                arrival_time: '',
                price: '',
                seats_total: '',
                seats_available: ''
            });
        } catch (err) {
            setError(err.message);
        }
    }

    // Update Flight
    async function handleUpdate(e) {
        e.preventDefault();
        setError('');
        setUpdateMsg('');
        const token = localStorage.getItem('token');
        if (!token) return router.replace('/login');

        const id = parseInt(updateData.flight_id, 10);
        if (isNaN(id)) {
            setError('Invalid Flight ID');
            return;
        }

        const payload = {
            from_city:        Number(updateData.from_city),
            to_city:          Number(updateData.to_city),
            departure_time:   updateData.departure_time,
            arrival_time:     updateData.arrival_time,
            price:            parseFloat(updateData.price),
            seats_total:      parseInt(updateData.seats_total, 10),
            seats_available:  parseInt(updateData.seats_total, 10)
        };

        try {
            const res = await fetch(`http://localhost:3000/flights/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.status === 404) {
                throw new Error('Flight not found');
            }
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || 'Update failed');
            }
            setUpdateMsg(`Flight #${id} updated`);
            setUpdateData({
                flight_id: '',
                from_city: '',
                to_city: '',
                departure_time: '',
                arrival_time: '',
                price: '',
                seats_total: '',
                seats_available: ''
            });
        } catch (err) {
            setError(err.message);
        }
    }

    // Delete Flight
    async function handleDelete(e) {
        e.preventDefault();
        setError('');
        setDeleteMsg('');
        const token = localStorage.getItem('token');
        if (!token) return router.replace('/login');

        const id = parseInt(deleteId, 10);
        if (isNaN(id)) {
            setError('Invalid Flight ID');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/flights/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.status === 404) {
                throw new Error('Flight not found');
            }
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || 'Delete failed');
            }
            setDeleteMsg(`Flight #${id} deleted`);
            setDeleteId('');
        } catch (err) {
            setError(err.message);
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
            {/* ─── Page‐Specific Navbar ─────────────────────────────────────────── */}
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
                            className="btn btn-accent btn-sm"
                            onClick={() => {
                                localStorage.removeItem('token');
                                router.replace('/admin/login');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="dashboard-background p-4">
                {/* ─── Create/Update/Delete Row ────────────────────────────────────── */}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                <h2 className="text-center mb-4 text-white">Manage Flights</h2>
                <div className="row row-symmetrical mb-5">
                    {/* Create Flight Card */}
                    <div className="col-md-4 mb-4">
                        <div className="card card-custom h-100">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-center">Create Flight</h5>
                                {createMsg && (
                                    <div className="alert alert-success">{createMsg}</div>
                                )}
                                <form onSubmit={handleCreate} className="flex-grow-1 d-flex flex-column">
                                    <div className="mb-2">
                                        <label htmlFor="create_from" className="form-label">
                                            From
                                        </label>
                                        <select
                                            id="create_from"
                                            className="form-select"
                                            value={createData.from_city}
                                            onChange={handleCreateChange('from_city')}
                                            required
                                        >
                                            <option value="">Select city</option>
                                            {cities.map((c) => (
                                                <option key={c.city_id} value={c.city_id}>
                                                    {c.city_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="create_to" className="form-label">
                                            To
                                        </label>
                                        <select
                                            id="create_to"
                                            className="form-select"
                                            value={createData.to_city}
                                            onChange={handleCreateChange('to_city')}
                                            required
                                        >
                                            <option value="">Select city</option>
                                            {cities.map((c) => (
                                                <option key={c.city_id} value={c.city_id}>
                                                    {c.city_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="create_dep" className="form-label">
                                            Departure
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="create_dep"
                                            className="form-control"
                                            value={createData.departure_time}
                                            onChange={handleCreateChange('departure_time')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="create_arr" className="form-label">
                                            Arrival
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="create_arr"
                                            className="form-control"
                                            value={createData.arrival_time}
                                            onChange={handleCreateChange('arrival_time')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="create_price" className="form-label">
                                            Price (₺)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            id="create_price"
                                            className="form-control"
                                            value={createData.price}
                                            onChange={handleCreateChange('price')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="create_total" className="form-label">
                                            Seats Total
                                        </label>
                                        <input
                                            type="number"
                                            id="create_total"
                                            className="form-control"
                                            value={createData.seats_total}
                                            onChange={handleCreateChange('seats_total')}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-accent w-100 mt-auto">
                                        Create
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Update Flight Card */}
                    <div className="col-md-4 mb-4">
                        <div className="card card-custom h-100">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-center">Update Flight</h5>
                                {updateMsg && (
                                    <div className="alert alert-success">{updateMsg}</div>
                                )}
                                <form onSubmit={handleUpdate} className="flex-grow-1 d-flex flex-column">
                                    <div className="mb-2">
                                        <label htmlFor="update_id" className="form-label">
                                            Flight ID
                                        </label>
                                        <input
                                            type="number"
                                            id="update_id"
                                            className="form-control"
                                            value={updateData.flight_id}
                                            onChange={handleUpdateChange('flight_id')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="update_from" className="form-label">
                                            From
                                        </label>
                                        <select
                                            id="update_from"
                                            className="form-select"
                                            value={updateData.from_city}
                                            onChange={handleUpdateChange('from_city')}
                                            required
                                        >
                                            <option value="">Select city</option>
                                            {cities.map((c) => (
                                                <option key={c.city_id} value={c.city_id}>
                                                    {c.city_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="update_to" className="form-label">
                                            To
                                        </label>
                                        <select
                                            id="update_to"
                                            className="form-select"
                                            value={updateData.to_city}
                                            onChange={handleUpdateChange('to_city')}
                                            required
                                        >
                                            <option value="">Select city</option>
                                            {cities.map((c) => (
                                                <option key={c.city_id} value={c.city_id}>
                                                    {c.city_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="update_dep" className="form-label">
                                            Departure
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="update_dep"
                                            className="form-control"
                                            value={updateData.departure_time}
                                            onChange={handleUpdateChange('departure_time')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="update_arr" className="form-label">
                                            Arrival
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="update_arr"
                                            className="form-control"
                                            value={updateData.arrival_time}
                                            onChange={handleUpdateChange('arrival_time')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="update_price" className="form-label">
                                            Price (₺)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            id="update_price"
                                            className="form-control"
                                            value={updateData.price}
                                            onChange={handleUpdateChange('price')}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="update_total" className="form-label">
                                            Seats Total
                                        </label>
                                        <input
                                            type="number"
                                            id="update_total"
                                            className="form-control"
                                            value={updateData.seats_total}
                                            onChange={handleUpdateChange('seats_total')}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-accent w-100 mt-auto">
                                        Update
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Delete Flight Card */}
                    <div className="col-md-4 mb-4">
                        <div className="card card-custom h-100">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-center">Delete Flight</h5>
                                {deleteMsg && (
                                    <div className="alert alert-success">{deleteMsg}</div>
                                )}
                                <form onSubmit={handleDelete} className="flex-grow-1 d-flex flex-column">
                                    <div className="mb-3">
                                        <label htmlFor="delete_id" className="form-label">
                                            Flight ID
                                        </label>
                                        <input
                                            type="number"
                                            id="delete_id"
                                            className="form-control"
                                            value={deleteId}
                                            onChange={(e) => setDeleteId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-accent w-100 mt-auto">
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── All Booked Tickets (Full‐Width Card) ───────────────────────── */}
                <h2 className="text-center mb-3 text-white">All Booked Tickets</h2>
                {ticketError && (
                    <div className="alert alert-danger text-center">{ticketError}</div>
                )}
                {tickets.length === 0 && !ticketError ? (
                    <div className="alert alert-info text-center">
                        No tickets have been booked yet.
                    </div>
                ) : (
                    <div className="card card-custom mb-5">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-custom">
                                    <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Passenger Name</th>
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
                        </div>
                    </div>
                )}

                {/* ─── Logout Button at Bottom ────────────────────────────────────── */}
                <div className="text-center mb-4">
                    <button
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                            localStorage.removeItem('token');
                            router.replace('/admin/login');
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* ─── STYLED‐JSX FOR CUSTOM CSS ────────────────────────────────────────── */}
            <style jsx>{`
        /* Full-page gradient background for dashboard */
        .dashboard-background {
          min-height: calc(100vh - 70px); /* account for navbar height */
          width: 100%;
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          padding-top: 2rem;
          padding-left: 1rem;
          padding-right: 1rem;
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

        /* Card (create/update/delete and tickets) customizations */
        .card-custom {
          background: #ffffff;
          border-radius: 0.75rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          border: none;
        }

        /* Accent button for “Create/Update/Delete” and “Logout” */
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

        /* Accent text color for loading spinner */
        .text-accent-teal {
          color: #2ac2c2 !important;
        }

        /* Custom table styling */
        .table-custom thead {
          background: linear-gradient(135deg, #2ac2c2 0%, #007bff 100%);
          color: #fff;
        }
        .table-custom th,
        .table-custom td {
          vertical-align: middle;
        }

        /* Spacing between columns in row-symmetrical */
        .row-symmetrical {
          margin-left: -1rem;
          margin-right: -1rem;
        }
        .row-symmetrical > .col-md-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
      `}</style>
        </>
    );
}