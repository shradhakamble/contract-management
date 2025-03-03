const { Contract, Job, Profile } = require('../model'); 
const { Sequelize, Transaction } = require('sequelize');
const { NotFoundError } = require('../utils/errors');


/**
 * Fetch all unpaid jobs for a profile
 * @param {number} profileId - Id of the authenticated user
 * @returns {Promise<Array>} - List of unpaid jobs
 */
const findAllUnpaidJobsByProfile = async (profileId) => {
    return await Job.findAll({
        include: [
            {
                model: Contract,
                where: {
                    [Sequelize.Op.or]: [
                        { ClientId: profileId },
                        { ContractorId: profileId },
                    ],
                    status: 'in_progress'
                }
            }
        ],
        where: {
            [Sequelize.Op.or]: [
                { paid: null },
                { paid: false }
            ]
        }
    });
};


/**
 * Fetch the job by ID
 * @param {number} jobId - ID of the job to fetch
 * @param {Transaction} transaction - Current transaction context
 * @returns {Promise<Job>} - Returns the Job object
 */
const findJobById = async (jobId, transaction) => {
    const job = await Job.findByPk(jobId, {
        transaction, 
        lock: transaction.LOCK.UPDATE, // Apply row-level locking
    });

    if (!job) {
        throw new NotFoundError('Job not found');
    }

    return job;
};


/**
 * Fetch the contract associated with a job
 * @param {number} jobId - ID of the job
 * @param {Transaction} transaction - Current transaction context
 * @returns {Promise<Contract>} - The contract object
 */
const findContractByJob = async (jobId, transaction) => {
    const job = await Job.findByPk(jobId, {
        include: [{ model: Contract }],
        transaction,
        lock: transaction.LOCK.UPDATE, // Apply row-level locking        
    });

    if (!job || !job.Contract) {
        throw new NotFoundError('Contract not found for the job');
    }

    return job.Contract;
};



/**
 * Fetch the client by ID
 * @param {number} clientId - ID of the client to fetch
 * @param {transaction} transaction - Current transaction context
 * @returns {Promise<Profile>} - Returns the Profile object of the client
 */
const findClientById = async (clientId, transaction) => {
    const client = await Profile.findByPk(clientId, { 
        transaction,
        lock: transaction.LOCK.UPDATE, // Apply row-level locking
    });

    if (!client) {
        throw new NotFoundError('Client not found');
    }
    return client;
};


/**
 * Fetch the contractor of the given job
 * @param {number} jobId - Id of the job to fetch contractor for 
 * @param {Transaction} transaction - Current transaction context
 * @returns {Promise<Profile>} - Returns the Profile object of the contractor
 */
const findContractorByJob = async (jobId, transaction) => {
    const job = await Job.findByPk(jobId, {
        include: [{ model: Contract, as: 'Contract' }],
        transaction,
        lock: transaction.LOCK.UPDATE, // Apply row-level locking
    });

    if(!job || !job.Contract) {
        throw new NotFoundError('Contractor not found for the job');
    }

    const contractor = await Profile.findByPk(job.Contract.ContractorId, { transaction });
    return contractor;
};


/**
 * Update balances for the client and contractor
 * @param {Profile} client - The client profile
 * @param {Profile} contractor - The contractor profile
 * @param {number} amount - Amount to transfer
 * @param {Transaction} transaction - Current transaction context
 */
const updateBalances = async (client, contractor, amount, transaction) => {
    // Deduct amount from client
    client.balance -= amount;

    // Add amount to contractor
    contractor.balance += amount;

    // Save updated balances within the transaction context
    await client.save({ transaction });
    await contractor.save({ transaction });
};


/**
 * Mark the job as paid
 * @param {number} jobId - Id of the job to mark as paid
 * @param {Transaction} transaction - Current transaction context
 */
const markJobAsPaid = async (jobId, transaction) => {
    const job = await Job.findByPk(jobId);
    job.paid = true; // update the job status
    job.paymentDate = new Date(); // Current date and time in ISO format

    // Save job status within the transaction context
    await job.save({ transaction }); 
}

/**
 * Check the payment status of a job
 * @param {number} jobId - Id of the job to check payment status
 * @returns {boolean} - Returns true if the job is paid, false otherwise
 */
const checkPaymentStatus = async (jobId) => {
    const job = await Job.findByPk(jobId);

    if (!job) {
        throw new NotFoundError('Job not found');
    }

    return job.paid; // Returns true if paid, false otherwise
};


module.exports = {
    findAllUnpaidJobsByProfile,
    findClientById,
    findContractByJob,
    findContractorByJob,
    findJobById,
    updateBalances,
    markJobAsPaid,
    checkPaymentStatus
};
