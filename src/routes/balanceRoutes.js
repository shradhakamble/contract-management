const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const { depositMoney } = require('../controllers/balanceController');

const router = express.Router();

// Deposit money into a client's balance
router.post('/deposit/:userId', getProfile, depositMoney);

module.exports = router;
