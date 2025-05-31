const {
    createFlight: svcCreate,
    updateFlight: svcUpdate,
    deleteFlight: svcDelete,
    filterFlights: svcFilter,
    findAllFlights: svcFindAll,
    findFlightById: svcFindById
} = require('../services/flightService');

function isISODate(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(str) &&
        !Number.isNaN(Date.parse(str + 'T00:00:00'));
}

/**
 * GET /flights
 * List **all** flights (each includes its seats array).
 */
async function getAllFlights(req, res, next) {
    try {
        const flights = await svcFindAll();
        res.json(flights);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /flights/filter
 * Filtered list by optional query params:
 *   origin (number), destination (number), date (YYYY-MM-DD)
 */
async function getFilteredFlights(req, res, next) {
    try {
        const { origin, destination, date } = req.query;
        const filters = {};

        if (origin !== undefined) {
            const o = Number(origin);
            if (Number.isNaN(o)) {
                return res.status(400).json({ error: 'Invalid origin: must be a number' });
            }
            filters.origin = o;
        }

        if (destination !== undefined) {
            const d = Number(destination);
            if (Number.isNaN(d)) {
                return res.status(400).json({ error: 'Invalid destination: must be a number' });
            }
            filters.destination = d;
        }

        if (date !== undefined) {
            if (!isISODate(date)) {
                return res.status(400).json({ error: 'Invalid date: must be YYYY-MM-DD' });
            }
            filters.date = date;
        }

        const flights = await svcFilter(filters);
        res.json(flights);
    } catch (err) {
        next(err);
    }
}

/**
 * POST /flights
 * Create a new flight (admin only).
 */
async function postFlight(req, res, next) {
    try {
        const {
            from_city, to_city,
            departure_time, arrival_time,
            price, seats_total, seats_available
        } = req.body;

        const errors = [];
        if (typeof from_city !== 'number')            errors.push('from_city must be a number');
        if (typeof to_city   !== 'number')            errors.push('to_city must be a number');
        if (!departure_time || isNaN(Date.parse(departure_time)))
            errors.push('departure_time must be a valid datetime');
        if (!arrival_time   || isNaN(Date.parse(arrival_time)))
            errors.push('arrival_time must be a valid datetime');
        if (typeof price     !== 'number')            errors.push('price must be a number');
        if (!Number.isInteger(seats_total))           errors.push('seats_total must be an integer');
        if (!Number.isInteger(seats_available))       errors.push('seats_available must be an integer');

        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const params = [
            from_city, to_city,
            departure_time, arrival_time,
            price, seats_total, seats_available
        ];
        const flight = await svcCreate(params);
        res.status(201).json(flight);
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /flights/:id
 * Update a flight (admin only).
 */
async function putFlight(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid flight ID' });
        }

        const {
            from_city, to_city,
            departure_time, arrival_time,
            price, seats_total, seats_available
        } = req.body;

        const errors = [];
        if (typeof from_city !== 'number')            errors.push('from_city must be a number');
        if (typeof to_city   !== 'number')            errors.push('to_city must be a number');
        if (!departure_time || isNaN(Date.parse(departure_time)))
            errors.push('departure_time must be a valid datetime');
        if (!arrival_time   || isNaN(Date.parse(arrival_time)))
            errors.push('arrival_time must be a valid datetime');
        if (typeof price     !== 'number')            errors.push('price must be a number');
        if (!Number.isInteger(seats_total))           errors.push('seats_total must be an integer');
        if (!Number.isInteger(seats_available))       errors.push('seats_available must be an integer');

        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const params = [
            from_city, to_city,
            departure_time, arrival_time,
            price, seats_total, seats_available,
            id
        ];
        const { changes } = await svcUpdate(params);
        if (changes === 0) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        const updated = await svcFindById(id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /flights/:id
 * Delete a flight (admin only).
 */
async function deleteFlight(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid flight ID' });
        }

        const { changes } = await svcDelete(id);
        if (changes === 0) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllFlights,
    getFilteredFlights,
    postFlight,
    putFlight,
    deleteFlight
};