// app.js
const express = require('express');

// ensure your SQLite DB (and migrations/seeding) runs on startup
const {getDb} = require('./db/db_setup');

getDb();

const {authenticate} = require("./middleware/Authenticate");
const cookieParser = require('cookie-parser');


const flightRoutes = require('./routes/FlightRoute');
const cityRoutes   = require('./routes/CityRoute');
const ticketRoutes = require('./routes/TicketRoute');
const authRoutes = require("./routes/AuthRoutes");
const cors    = require('cors');


const errorHandler = require('./helpers/ErrorHandler');

const app = express();
app.use(cookieParser());        // <-- add this

app.use(cors({
    origin:        'http://localhost:3001',
    methods:       ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials:   true       // <— this lets the browser accept/set cookies
}));

// 1) Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded( { extended: true }));

// ❶ Public auth endpoints
app.use('/auth', authRoutes);

// ❷ All other endpoints require a valid JWT
app.use(authenticate);

// 2) Mount your routers
app.use('/flights', flightRoutes);
app.use('/cities',   cityRoutes);
app.use('/tickets',  ticketRoutes);

// 3) Global error handler (must come after all routes)
app.use(errorHandler);

// 4) Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API listening at http://localhost:${PORT}`);
});