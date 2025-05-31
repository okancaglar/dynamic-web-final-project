const express = require('express');
const {
    getAllFlights,
    getFilteredFlights,
    postFlight,
    putFlight,
    deleteFlight
} = require('../controllers/flightController');

const { authorizeAdmin } = require("../middleware/Authenticate");

const router = express.Router();

router.get('/',       getAllFlights);
router.get('/filter', getFilteredFlights);
router.post('/', authorizeAdmin, postFlight);
router.put('/:id', authorizeAdmin, putFlight);
router.delete('/:id', authorizeAdmin, deleteFlight);

module.exports = router;