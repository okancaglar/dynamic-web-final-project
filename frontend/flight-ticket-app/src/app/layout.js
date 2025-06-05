// src/app/layout.js
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

export const metadata = {
    title: 'Flight Ticket App',
    description: 'Symmetrical, Hopper‐inspired flight booking UI',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <head>
            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
                rel="stylesheet"
            />
        </head>
        <body>
        {/* ─── Navbar (app‐wide) ───────────────────────────────────────── */}
         {children}
        </body>
        </html>
    );
}