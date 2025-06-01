const {
    createTicket: svcCreate,
    getAllTickets: svcGetAll
} = require('../services/TicketService');
const { sendTicketConfirmation } = require('../helpers/EmailService');

/**
 * POST /tickets
 * Create a new ticket, send confirmation email, and return the ticket.
 */
async function postTicket(req, res, next) {
    try {
        const {
            passenger_name,
            passenger_surname,
            passenger_email,
            flight_id,
            seat_number
        } = req.body;

        // Basic validation
        const errors = [];
        if (typeof passenger_name !== 'string' || !passenger_name.trim())
            errors.push('passenger_name is required');
        if (typeof passenger_surname !== 'string' || !passenger_surname.trim())
            errors.push('passenger_surname is required');
        if (
            typeof passenger_email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger_email)
        )
            errors.push('passenger_email must be a valid email');
        if (typeof flight_id !== 'number' || Number.isNaN(flight_id))
            errors.push('flight_id must be a number');
        if (
            seat_number !== undefined &&
            (typeof seat_number !== 'number')
        )
            errors.push('seat_number must be number when provided');

        if (errors.length) {
            return res.status(400).json({ errors });
        }

        // Create the ticket
        const ticket = await svcCreate({
            passenger_name,
            passenger_surname,
            passenger_email,
            flight_id,
            seat_number
        });

        /*
        sendTicketConfirmation(passenger_email, ticket).catch(err =>
            console.error('Email send error:', err)
        );
        */
        res.status(201).json(ticket);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /tickets
 * Fetch all tickets.
 */
async function getAllTickets(req, res, next) {
    try {
        const tickets = await svcGetAll();
        res.json(tickets);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    postTicket,
    getAllTickets
};