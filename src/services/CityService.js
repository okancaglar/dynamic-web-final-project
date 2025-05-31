const {getDb} = require('../db/db_setup');

/**
 * Fetch all cities, ordered by name.
 * @returns {Promise<Array<{ city_id: number, city_name: string }>>}
 */
function getAllCities() {
    const sql = `SELECT * FROM City ORDER BY city_name`;
    const db  = getDb();

    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) =>
            err ? reject(err) : resolve(rows)
        );
    });
}

/**
 * Fetch a single city by its ID.
 * @param {number} id  The city_id to look up.
 * @returns {Promise<{ city_id: number, city_name: string }|undefined>}
 */
function getCityById(id) {
    const sql = `SELECT * FROM City WHERE city_id = ?`;
    const db  = getDb();

    return new Promise((resolve, reject) => {
        db.get(sql, [id], (err, row) =>
            err ? reject(err) : resolve(row)
        );
    });
}

module.exports = {
    getAllCities,
    getCityById
};