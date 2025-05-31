// src/app/api/auth/login/route.js
"use server";

import { NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Forwards to Express /auth/login. On success, Express sets a cookie on its own domain,
 * but we want to “mirror” that Set-Cookie onto our Next.js domain so that Next.js can read it.
 *
 * Therefore:
 *   1) We fetch to http://localhost:3000/auth/login  (with body).
 *   2) If Express responds with Set-Cookie, we grab it from res.headers.get('set-cookie')
 *   3) We set the same cookie on the Next.js response (httpOnly, sameSite, etc.).
 *   4) We forward the JSON payload to the client.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        // 1) Call Express
        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // We must include credentials if Express expects them, but since no cookie is yet present, omit credentials here.
        });

        const data = await res.json();
        // If login failed, just return that status & JSON:
        if (!res.ok) {
            return new NextResponse(JSON.stringify(data), { status: res.status });
        }

        // 2) On success (res.ok), Express has done: res.cookie('token', <jwt>, { httpOnly, sameSite:'none', … })
        //    but that Set-Cookie header was for domain=localhost:3000. We want to set that cookie on localhost:3001.
        //    So we grab their “set-cookie” header and re‐set it on our response.
        const setCookie = res.headers.get('set-cookie');
        const response = NextResponse.json(data, { status: 200 });
        if (setCookie) {
            // Mirror the cookie, but ensure “Secure” is false in dev:
            // The Set-Cookie from Express likely looks like:
            //    token=eyJ...; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=3600
            // We’ll remove “Secure” if present, because on http://localhost it’s invalid.
            const parts = setCookie.split(';').map((p) => p.trim());
            // Filter out “Secure” in dev:
            const filtered = parts.filter((p) => p.toLowerCase() !== 'secure');
            // Re‐join:
            const cookieValue = filtered.join('; ');

            console.log("cookie is set" + cookieValue.split('=')[1].split(';')[0]);

            // Finally, set it on Next.js response:
            response.cookies.set({
                name: 'token',
                value: cookieValue.split('=')[1].split(';')[0], // get “eyJ...” portion
                httpOnly: true,
                path: '/',
                sameSite: 'none',
                // secure: true  → In production you’d uncomment this. In dev, we must keep it false.
                maxAge: 60 * 60, // 1 hour in seconds
            });
        }

        return response;
    } catch (err) {
        console.error('Nextjs /api/auth/login error:', err);
        return new NextResponse(
            JSON.stringify({ error: 'Login request failed' }),
            { status: 500 }
        );
    }
}