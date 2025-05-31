// src/services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { getDb } = require('../db/db_setup');

const JWT_SECRET     = 'my_very_long_and_random_secret_key';
const JWT_EXPIRES_IN = '1h';

async function registerUser(email, password, isAdmin = 0) {
    const db = getDb();
    const hash = await bcrypt.hash(password, 10);
    return new Promise((res, rej) => {
        db.run(
            `INSERT INTO User (email, password, is_admin) VALUES (?, ?, ?)`,
            [email, hash, isAdmin],
            function(err) {
                err ? rej(err) : res({ email });
            }
        );
    });
}

async function login(email, password) {
    const db = getDb();
    const user = await new Promise((res, rej) => {
        db.get(`SELECT * FROM User WHERE email = ?`, [email], (e, row) =>
            e ? rej(e) : res(row)
        );
    });
    if (!user) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Invalid credentials');

    const payload = { email, isAdmin: !!user.is_admin };
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN || '1h'
    });
    return token;
}

module.exports = { registerUser, login };