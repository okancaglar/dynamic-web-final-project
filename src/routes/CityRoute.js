const express = require('express');
const { getAllCities, getCityById } = require('../controllers/CityController');

const router = express.Router();
router.get('/all', getAllCities);
router.get('/:id', getCityById);

module.exports = router;