const express = require('express');
const { getBestProfession } = require('../controllers/adminController');
const { getBestClients } = require('../controllers/adminController');


const router = express.Router();

// Route for getting best profession
router.get('/best-profession', getBestProfession);

// Route for getting best clients
router.get('/best-clients', getBestClients);

module.exports = router;
