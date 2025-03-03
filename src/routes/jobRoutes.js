const express = require('express');
const { getUnpaidJobs } = require('../controllers/jobController'); 
const { payForJob } = require('../controllers/jobController');
const { getProfile } = require('../middleware/getProfile'); 

const router = express.Router();

// Route to get unpaid jobs for a user
router.get('/unpaid', getProfile, getUnpaidJobs);

// Define the route fpr paying for a job
router.post('/:job_id/pay', getProfile, payForJob);

module.exports = router;
