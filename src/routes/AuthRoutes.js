// src/routers/AuthRoutes.js
const express = require('express');
const { postRegister, postLogin, getMe, postLogout } = require('../controllers/AuthController');
const jwt          = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET     = 'my_very_long_and_random_secret_key';


router.post('/register', postRegister);
router.post('/login',    postLogin);
router.get('/me', getMe);

router.post('/logout', postLogout);


module.exports = router;