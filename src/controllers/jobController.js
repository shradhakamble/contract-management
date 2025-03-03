const jobService = require('../services/jobService'); 
const { InternalServerError, NotFoundError } = require('../utils/errors'); 

/**
 * Fetch all unpaid jobs for a user
 * @route GET /api/jobs/unpaid
 * @return List of unpaid jobs
 */
const getUnpaidJobs = async (req, res, next) => {
    try {
        const profile = req.profile; 

        // Call the service layer to get unpaid jobs
        const unpaidJobs = await jobService.getUnpaidJobs(profile.id);
        return res.json(unpaidJobs);
    } catch (error) {
        console.error('Error fetching unpaid jobs:', error);
        return next(new InternalServerError(error));
    }
};


/**
 * Pay for a job
 * @route POST /api/jobs/:job_id/pay
 * @access Client only
 * @returns Success/Failure
 */
const payForJob = async (req, res, next) => {
    
    try {

        const jobId = req.params.job_id;
        const clientId = req.profile.id;

        // Validate jobId
        if (!jobId) {
            throw new NotFoundError('Job not found');
        }

        await jobService.payForJob(jobId, clientId);
        return res.status(200).json({ message: 'Payment Successful!' });
    } catch (error) {
        console.error('Error while paying for a job:', error);
        return next(error);
    }
};



module.exports = {
    getUnpaidJobs,
    payForJob,
};
