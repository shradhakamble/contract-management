const jobRepository = require('../repositories/jobRepository'); 
const { Validator } = require('../utils/validator');
const { sequelize } = require('../model');
const { NotFoundError } = require('../utils/errors');


/**
 * Fetch all unpaid jobs for a user
 * @param {number} profileId - Id of the authenticated user
 * @returns {Promise<Array>} - List of unpaid jobs
 */
const getUnpaidJobs = async (profileId) => {
    return jobRepository.findAllUnpaidJobsByProfile(profileId);
};


/**
 * Pay for the job
 * @param {number} jobId - ID of the job to be paid
 * @param {number} clientId - ID of the client making the payment
 * @returns {Promise<string>} - Success Message
 */
const payForJob = async (jobId, clientId) => {
    // Start the transaction (SQLite defaults to SERIALIZABLE)
    const transaction = await sequelize.transaction();  

    try {

        /**
         * Fetch job, client, and contractor details within the transaction scope.
         * Use row-level locks (`lock: true`) to prevent other transactions from modifying
         * or reading these rows until the current transaction completes.
         *
         * Row-level locking is critical to ensure:
         * - Data consistency: Prevent double-spending or multiple updates to the same data.
         * - Isolation: Avoid conflicts with concurrent transactions attempting similar operations.
         */        
        
        // Fetch the job and associated contract details
        const job = await jobRepository.findJobById(jobId, transaction);

        // Ensure the job exists and belongs to a contract associated with the client
        const contract = await jobRepository.findContractByJob(jobId, transaction);
        console.log('contract : ', contract);
        if (!contract || contract.ClientId !== clientId) {
            throw new NotFoundError('Job does not belong to the client');
        }

        // Ensure job payments only for contracts in_progress
        if (contract.status !== 'in_progress') {
            throw new NotFoundError('Job payments only for contracts in_progress');
        }

        // Fetch client and contractor profiles
        const client = await jobRepository.findClientById(clientId, transaction);
        const contractor = await jobRepository.findContractorByJob(jobId, transaction);

        if (client.type !== 'client') {
            throw new NotFoundError('Client not found');
        }

        // Validate payment conditions
        Validator.validatePayment(client, job);
    
        // Perform payment: update balances and mark job as paid
        await jobRepository.updateBalances(client, contractor, job.price, transaction);
        await jobRepository.markJobAsPaid(jobId, transaction);

        // Commit the transaction
        await transaction.commit();

        return 'Payment Successful';
    } catch (error) {
        // Rollback transaction in case of any error
        console.error('Error while paying for job:', error); 
        await transaction.rollback();
        throw error;
    }
};


module.exports = {
    getUnpaidJobs,
    payForJob
};
