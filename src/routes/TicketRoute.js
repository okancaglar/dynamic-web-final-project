const express = require('express');
const { postTicket, getAllTickets } = require('../controllers/TicketController');

const router = express.Router();
router.post('/', postTicket);
router.get('/', getAllTickets);

module.exports = router;