/*
* data structure for createFlight:
*   const params = [
        data.from_city,
        data.to_city,
        data.departure_time,
        data.arrival_time,
        data.price,
        data.seats_total,
        data.seats_available
    ];

* data structure for update flight:
*   const params = [
        data.from_city,
        data.to_city,
        data.departure_time,
        data.arrival_time,
        data.price,
        data.seats_total,
        data.seats_available,
        id
    ];
* */


const {getDb} = require('../db/db_setup');

/**
 * Insert seed Seat rows for a newly created flight.
 * @param {number} flight_id
 * @param {number} seats_total
 * @returns {Promise<void>}
 */
function seedSeatsForFlight(flight_id, seats_total) {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare(
                `INSERT INTO Seat (flight_id, seat_number) VALUES (?, ?)`
            );
            for (let n = 1; n <= seats_total; n++) {
                stmt.run(flight_id, String(n), err => {
                    if (err) console.error('Seat seed failed for', flight_id, n, err.message);
                });
            }
            stmt.finalize(err => (err ? reject(err) : resolve()));
        });
    });
}

/**
 * Fetch all seats for a given flight.
 * @param {number} flight_id
 * @returns {Promise<Array<{ seat_id: number, seat_number: string, is_booked: number }>>}
 */
function getSeatsByFlightId(flight_id) {
    const db = getDb();
    const sql = `
    SELECT seat_id, seat_number, is_booked
      FROM Seat
     WHERE flight_id = ?
  `;
    return new Promise((resolve, reject) => {
        db.all(sql, [flight_id], (err, rows) =>
            err ? reject(err) : resolve(rows)
        );
    });
}

/**
 * Create a new flight, seed its seats, and return the full Flight+seats object.
 * @param {Array} params
 * @returns {Promise<Object>} { flight_id, from_city, to_city, …, seats: […] }
 */
async function createFlight(params) {
    const db = getDb();
    // 1) insert flight
    const flight_id = await new Promise((res, rej) => {
        const sql = `
      INSERT INTO Flight
        (from_city, to_city, departure_time, arrival_time, price, seats_total, seats_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        db.run(sql, params, function(err) {
            return err ? rej(err) : res(this.lastID);
        });
    });

    // 2) seed Seat rows
    const seats_total = params[5];
    await seedSeatsForFlight(flight_id, seats_total);

    // 3) return the newly created flight + its seats
    return findFlightById(flight_id);
}

/**
 * Get all flights, each with its seats.
 * @returns {Promise<Array<Object>>}
 */
async function findAllFlights() {
    const db = getDb();
    const sql = `SELECT * FROM Flight ORDER BY departure_time`;
    const flights = await new Promise((res, rej) =>
        db.all(sql, [], (err, rows) => (err ? rej(err) : res(rows)))
    );

    // attach seats to each flight
    return Promise.all(
        flights.map(async flight => ({
            ...flight,
            seats: await getSeatsByFlightId(flight.flight_id)
        }))
    );
}

/**
 * Get one flight by ID, including its seats.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function findFlightById(id) {
    const db = getDb();
    const sql = `SELECT * FROM Flight WHERE flight_id = ?`;
    const flight = await new Promise((res, rej) =>
        db.get(sql, [id], (err, row) => (err ? rej(err) : res(row)))
    );
    if (!flight) return null;

    const seats = await getSeatsByFlightId(id);
    return { ...flight, seats };
}

/**
 * Update a flight’s core fields.
 * (NOTE: does NOT currently adjust Seat rows if seats_total changes.)
 * @param {Array} params
 * @returns {Promise<Object>} { changes }
 */
function updateFlight(params) {
    const {
        from_city,
        to_city,
        departure_time,
        arrival_time,
        price,
        seats_total: newTotal,
        flight_id
    } = params;

    const db = getDb();

    return new Promise((resolve, reject) => {
        // 1) Fetch the existing flight to get old seats_total
        db.get(
            `SELECT seats_total
         FROM Flight
        WHERE flight_id = ?`,
            [flight_id],
            (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return reject(new Error('Flight not found'));
                }

                const oldTotal = row.seats_total;

                // 2) Begin the transaction
                db.run('BEGIN TRANSACTION;', (err) => {
                    if (err) return reject(err);

                    // 3) Update the flight's main columns (excluding seats_available)
                    db.run(
                        `UPDATE Flight
               SET from_city       = ?,
                   to_city         = ?,
                   departure_time  = ?,
                   arrival_time    = ?,
                   price           = ?,
                   seats_total     = ?
             WHERE flight_id       = ?`,
                        [
                            from_city,
                            to_city,
                            departure_time,
                            arrival_time,
                            price,
                            newTotal,
                            flight_id
                        ],
                        function (err) {
                            if (err) {
                                return db.run('ROLLBACK;', () => reject(err));
                            }
                            if (this.changes === 0) {
                                // No rows updated—could have been deleted concurrently
                                return db.run('ROLLBACK;', () => reject(new Error('Flight not found during update')));
                            }

                            // Calculate difference in total seats
                            const diff = newTotal - oldTotal;

                            if (diff > 0) {
                                // 4a) Seats increased: insert seat_numbers oldTotal+1 .. newTotal
                                let i = oldTotal + 1;

                                function addNextSeat() {
                                    if (i > newTotal) {
                                        // Done inserting → recalc availability
                                        return recalcAvailable();
                                    }
                                    const seatNumber = String(i);
                                    db.run(
                                        `INSERT INTO Seat (flight_id, seat_number, is_booked)
                          VALUES (?, ?, 0)`,
                                        [flight_id, seatNumber],
                                        (err) => {
                                            if (err) {
                                                return db.run('ROLLBACK;', () => reject(err));
                                            }
                                            i += 1;
                                            addNextSeat();
                                        }
                                    );
                                }
                                addNextSeat();

                            } else if (diff < 0) {
                                // 4b) Seats decreased: remove seat_numbers newTotal+1 .. oldTotal (only if un‐booked)
                                let i = oldTotal;

                                function removeSeatIfPossible() {
                                    if (i <= newTotal) {
                                        // Done deleting → recalc availability
                                        return recalcAvailable();
                                    }
                                    const seatNumber = String(i);
                                    // Check if this seat is booked
                                    db.get(
                                        `SELECT is_booked
                       FROM Seat
                      WHERE flight_id = ?
                        AND seat_number = ?`,
                                        [flight_id, seatNumber],
                                        (err, seatRow) => {
                                            if (err) {
                                                return db.run('ROLLBACK;', () => reject(err));
                                            }
                                            if (!seatRow) {
                                                // Seat doesn't exist (skip it)
                                                i -= 1;
                                                return removeSeatIfPossible();
                                            }
                                            if (seatRow.is_booked) {
                                                // Cannot remove a booked seat
                                                return db.run(
                                                    'ROLLBACK;',
                                                    () => reject(new Error(`Cannot remove seat ${seatNumber} as it is already booked`))
                                                );
                                            }
                                            // Safe to delete this seat row
                                            db.run(
                                                `DELETE FROM Seat
                           WHERE flight_id = ?
                             AND seat_number = ?`,
                                                [flight_id, seatNumber],
                                                (err) => {
                                                    if (err) {
                                                        return db.run('ROLLBACK;', () => reject(err));
                                                    }
                                                    i -= 1;
                                                    removeSeatIfPossible();
                                                }
                                            );
                                        }
                                    );
                                }
                                removeSeatIfPossible();

                            } else {
                                // 4c) diff === 0 → no change in seat count. Just recalc availability:
                                recalcAvailable();
                            }

                            // 5) Recalculate seats_available
                            function recalcAvailable() {
                                db.get(
                                    `SELECT COUNT(*) AS availableCount
                     FROM Seat
                    WHERE flight_id = ?
                      AND is_booked = 0`,
                                    [flight_id],
                                    (err, countRow) => {
                                        if (err) {
                                            return db.run('ROLLBACK;', () => reject(err));
                                        }
                                        const newAvailable = countRow.availableCount;

                                        // 6) Write seats_available back into Flight
                                        db.run(
                                            `UPDATE Flight
                          SET seats_available = ?
                        WHERE flight_id = ?`,
                                            [newAvailable, flight_id],
                                            (err) => {
                                                if (err) {
                                                    return db.run('ROLLBACK;', () => reject(err));
                                                }

                                                // 7) Commit the entire transaction
                                                db.run('COMMIT;', (err) => {
                                                    if (err) {
                                                        return reject(err);
                                                    }
                                                    // All done—resolve with the updated counts
                                                    resolve({
                                                        changes: this.changes,       // from the first UPDATE Flight
                                                        seats_total: newTotal,
                                                        seats_available: newAvailable
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        }
                    );
                });
            }
        );
    });
}

/**
 * Delete a flight (its Seat rows should cascade if FKs are set with ON DELETE CASCADE).
 * @param {number} id
 * @returns {Promise<Object>} { changes }
 */
function deleteFlight(id) {
    const db = getDb();
    const sql = `DELETE FROM Flight WHERE flight_id = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [id], function(err) {
            return err ? reject(err) : resolve({ changes: this.changes });
        });
    });
}

/**
 * Filter flights by optional origin, destination, date—each result includes its seats.
 * @param {Object} filters
 * @returns {Promise<Array<Object>>}
 */
async function filterFlights({ origin, destination, date } = {}) {
    const db      = getDb();
    const clauses = [];
    const params  = [];

    if (origin) {
        clauses.push('from_city = ?');
        params.push(origin);
    }
    if (destination) {
        clauses.push('to_city = ?');
        params.push(destination);
    }
    if (date) {
        clauses.push("date(departure_time) = ?");
        params.push(date);
    }

    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const sql   = `SELECT * FROM Flight ${where} ORDER BY departure_time`;

    const flights = await new Promise((res, rej) =>
        db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
    );

    return Promise.all(
        flights.map(async flight => ({
            ...flight,
            seats: await getSeatsByFlightId(flight.flight_id)
        }))
    );
}

module.exports = {
    createFlight,
    findAllFlights,
    findFlightById,
    updateFlight,
    deleteFlight,
    filterFlights
};