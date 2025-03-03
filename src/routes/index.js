const express = require('express');
const contractRoutes = require('./contractRoutes');
const jobRoutes = require('./jobRoutes'); 
const depositRoutes = require('./balanceRoutes');
const adminRoutes = require('./adminRoutes');


const router = express.Router();

// Register contract routes 
router.use('/contracts', contractRoutes);

// Register job routes
router.use('/jobs', jobRoutes); 

// Register deposit money routes
router.use('/balances', depositRoutes);

// Register admin routes
router.use('/admin', adminRoutes);


module.exports = router;