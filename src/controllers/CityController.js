// src/controllers/cityController.js

const {
    getAllCities: svcGetAllCities,
    getCityById: svcGetCityById
} = require('../services/CityService');

/**
 * GET /cities
 * Fetch and return all cities.
 */
async function getAllCities(req, res, next) {
    try {
        const cities = await svcGetAllCities();
        res.json(cities);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /cities/:id
 * Fetch a single city by its ID.
 */
async function getCityById(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid city ID' });
        }

        const city = await svcGetCityById(id);
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.json(city);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllCities,
    getCityById
};