const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const { getContractById, getAllActiveContracts } = require('../controllers/contractController');

const router = express.Router();

// Route to fetch a contract by ID
router.get('/:id', getProfile, getContractById);

// Route to get all active contracts
router.get('/', getProfile, getAllActiveContracts);

module.exports = router;
