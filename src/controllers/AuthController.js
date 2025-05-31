// src/controllers/AuthController.js
const { registerUser, login } = require('../services/AuthService');
const {verify} = require("jsonwebtoken");
const JWT_SECRET = 'my_very_long_and_random_secret_key';


async function postRegister(req, res, next) {
    try {
        const { email, password, isAdmin } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email & password required' });
        }
        await registerUser(email, password, isAdmin ? 1 : 0);
        res.status(201).json({ email });
    } catch (err) {
        next(err);
    }
}

async function postLogin(req, res) {
    try {
        const { email, password } = req.body;
        const token = await login(email, password);
        // Return the token in JSON (no cookies)
        res.json({ token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

async function getMe(req, res) {
    try {
        // Expect header: Authorization: Bearer <token>
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: 'No Authorization header provided' });
        }

        // 2) Expect format: “Bearer <token>”
        //    Split on the first space into [scheme, token]
        const parts = authHeader.trim().split(/\s+/, 2);
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Malformed Authorization header' });
        }

        const token = parts[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // 3) Verify the token
        verify(token, JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json({error: 'Invalid or expired token'});
            }
            return res.json({ email: payload.email, isAdmin: payload.isAdmin });

        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

async function postLogout(req, res) {
    // With localStorage, “logout” is purely client side (we can optionally blacklist server‐side, but not required here).
    return res.json({ success: true });
}

module.exports = {
    postRegister,
    postLogin,
    getMe,
    postLogout
};