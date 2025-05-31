// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Forwards to Express /auth/logout, then clears the cookie on Next.js side.
 */
export async function POST(request) {
    try {
        // Forward the cookie header so Express knows which JWT to clear (though /logout just sets it to empty).
        const cookieHeader = request.headers.get('cookie') || '';
        const res = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            headers: { cookie: cookieHeader }
        });
        const data = await res.json();

        // Build NextResponse and clear our “token” cookie
        const nextRes = new NextResponse(JSON.stringify(data), { status: res.status });
        // Overwrite the cookie to expire:
        nextRes.cookies.set({
            name: 'token',
            value: '',
            maxAge: 0,
            path: '/'
        });
        return nextRes;
    } catch (err) {
        console.error('Next.js /api/auth/logout error', err);
        return new NextResponse(
            JSON.stringify({ error: 'Logout request failed' }),
            { status: 500 }
        );
    }
}