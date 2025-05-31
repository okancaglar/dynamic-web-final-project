// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/me
 * We simply forward the existing cookie to Express’s /auth/me.
 * If Express verifies JWT successfully, they return { email, isAdmin }.
 * If not, they return 401.
 */
export async function GET(request) {
    try {
        // Forward the “cookie” header from Next.js request to Express:
        const cookieHeader = request.headers.get('cookie') || '';
        const res = await fetch('http://localhost:3000/auth/me', {
            method: 'GET',
            headers: { cookie: cookieHeader }
        });

        const data = await res.json();
        return new NextResponse(JSON.stringify(data), { status: res.status });
    } catch (err) {
        console.error('Next.js /api/auth/me error', err);
        return new NextResponse(
            JSON.stringify({ error: 'Unable to verify authentication' }),
            { status: 500 }
        );
    }
}