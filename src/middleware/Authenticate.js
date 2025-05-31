// src/middleware/authenticate.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'my_very_long_and_random_secret_key';

/**
 * Reads the “Authorization” header (Bearer <token>),
 * verifies the JWT, and on success attaches payload to req.user.
 */
function authenticate(req, res, next) {
    // 1) Get Authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }

    // 2) Header should be in form “Bearer <token>”
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Malformed authorization header' });
    }

    // 3) Verify JWT
    try {
        console.log("before jwt verif");
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // e.g. { email, isAdmin, iat, exp }
        console.log(req.user);
        next();
    } catch (err) {
        console.log("jwt verification blows");
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Only allow users with isAdmin === true.
 * Must be used after authenticate middleware.
 */
function authorizeAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

module.exports = { authenticate, authorizeAdmin };