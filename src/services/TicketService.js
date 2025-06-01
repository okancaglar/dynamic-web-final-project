// src/services/ticketService.js
const { getDb } = require('../db/db_setup');

/**
 * Create a new ticket and atomically:
 *  - mark the seat as booked,
 *  - insert the Ticket,
 *  - decrement Flight.seats_available.
 * Returns the created ticket with seat info.
 *
 * @param {Object} data
 * @param {string} data.passenger_name
 * @param {string} data.passenger_surname
 * @param {string} data.passenger_email
 * @param {number} data.flight_id
 * @param {number} data.seat_id
 * @returns {Promise<Object>} the new ticket joined with seat_number
 */
function createTicket(data) {
    const {
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number
    } = data;
    const db = getDb();
    console.log(data);

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 1) begin transaction
            db.run('BEGIN', err => {
                if (err) return reject(err);

                // 2) check seat exists, belongs to flight, and is free
                db.get(
                    `SELECT seat_id, is_booked
                     FROM Seat
                     WHERE flight_id = ?
                       AND seat_number = ?`,
                    [flight_id, seat_number],
                    (err, seatRow) => {
                        if (err) {
                            return db.run('ROLLBACK;', () => reject(err));
                        }
                        if (!seatRow) {
                            return db.run(
                                'ROLLBACK;',
                                () => reject(new Error('Seat not found or does not belong to this flight'))
                            );
                        }
                        if (seatRow.is_booked) {
                            return db.run(
                                'ROLLBACK;',
                                () => reject(new Error('Seat already booked'))
                            );
                        }

                        const seat_id = seatRow.seat_id;
                        // 3) mark seat booked
                        db.run(
                            `UPDATE Seat SET is_booked = 1 WHERE seat_id = ?`,
                            [seat_id],
                            err => {
                                if (err) return db.run('ROLLBACK', () => reject(err));

                                // 4) insert ticket
                                db.run(
                                    `INSERT INTO Ticket
                     (passenger_name, passenger_surname, passenger_email, flight_id, seat_id)
                   VALUES (?, ?, ?, ?, ?)`,
                                    [
                                        passenger_name,
                                        passenger_surname,
                                        passenger_email,
                                        flight_id,
                                        seat_id
                                    ],
                                    function(err) {
                                        if (err) return db.run('ROLLBACK', () => reject(err));
                                        const ticket_id = this.lastID;

                                        // 5) decrement available seats
                                        db.run(
                                            `UPDATE Flight
                         SET seats_available = seats_available - 1
                       WHERE flight_id = ?`,
                                            [flight_id],
                                            err => {
                                                if (err) return db.run('ROLLBACK', () => reject(err));

                                                // 6) commit
                                                db.run('COMMIT', err => {
                                                    if (err) return reject(err);

                                                    // 7) fetch and return the full ticket + seat_number
                                                    db.get(
                                                        `SELECT t.*, s.seat_number
                               FROM Ticket AS t
                               JOIN Seat   AS s USING(seat_id)
                              WHERE t.ticket_id = ?`,
                                                        [ticket_id],
                                                        (err, row) => {
                                                            if (err) reject(err);
                                                            else       resolve(row);
                                                        }
                                                    );
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    });
}

/**
 * Fetch all tickets, each joined with its seat_number.
 * @returns {Promise<Array<Object>>}
 */
function getAllTickets() {
    const db = getDb();
    const sql = `
    SELECT t.*, s.seat_number, s.is_booked
      FROM Ticket AS t
      JOIN Seat   AS s USING(seat_id)
  `;
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) =>
            err ? reject(err) : resolve(rows)
        );
    });
}

/**
 * Fetch one ticket by ID, with seat info.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
function getTicketById(id) {
    const db = getDb();
    const sql = `
    SELECT t.*, s.seat_number, s.is_booked
      FROM Ticket AS t
      JOIN Seat   AS s USING(seat_id)
     WHERE t.ticket_id = ?
  `;
    return new Promise((resolve, reject) => {
        db.get(sql, [id], (err, row) =>
            err ? reject(err) : resolve(row)
        );
    });
}

/**
 * Delete a ticket, free its seat, and increment seats_available.
 * @param {number} id
 * @returns {Promise<number>} number of deleted rows (0 or 1)
 */
function deleteTicket(id) {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN', err => {
                if (err) return reject(err);

                // 1) find the ticket to get flight_id & seat_id
                db.get(
                    `SELECT flight_id, seat_id FROM Ticket WHERE ticket_id = ?`,
                    [id],
                    (err, ticket) => {
                        if (err) return db.run('ROLLBACK', () => reject(err));
                        if (!ticket)
                            return db.run('ROLLBACK', () => resolve(0));  // not found

                        // 2) delete the ticket
                        db.run(
                            `DELETE FROM Ticket WHERE ticket_id = ?`,
                            [id],
                            function(err) {
                                if (err) return db.run('ROLLBACK', () => reject(err));

                                // 3) free the seat
                                db.run(
                                    `UPDATE Seat SET is_booked = 0 WHERE seat_id = ?`,
                                    [ticket.seat_id],
                                    err => {
                                        if (err) return db.run('ROLLBACK', () => reject(err));

                                        // 4) increment available seats
                                        db.run(
                                            `UPDATE Flight SET seats_available = seats_available + 1 WHERE flight_id = ?`,
                                            [ticket.flight_id],
                                            err => {
                                                if (err) return db.run('ROLLBACK', () => reject(err));

                                                // 5) commit
                                                db.run('COMMIT', err => {
                                                    if (err) return reject(err);
                                                    resolve(this.changes);  // from DELETE
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    });
}

module.exports = {
    createTicket,
    getAllTickets,
    getTicketById,
    deleteTicket
};