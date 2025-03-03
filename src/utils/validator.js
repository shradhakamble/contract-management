const { ValidationError, BadRequestError } = require('./errors');


class Validator {

    /**
     * Validate the payment conditions
     * @param {Profile} client - The client profile
     * @param {Job} job - The job to be paid for
     */
    static validatePayment = (client, job) => {

        // Check if job has already paid
        if (job.paid) {
            throw new ValidationError('Job already paid');
        }
        
        // Check if the client has enough balance
        if (client.balance < job.price) {
            throw new ValidationError('Insufficient balance');
        }
    };


    /**
     * Validate the deposit amount
     * @param {number} totalAmountDue - Total amount due for unpaid jobs
     * @param {number} amount - Amount to deposit
     */
    static validateDeposit = (totalAmountDue, amount) => {
        // Check if there are unpaid jobs
        if (amount === 0) {
            throw new BadRequestError('Amount can not be 0');
        }

        if (amount < 0) {
            throw new BadRequestError('Amount can not be negative');
        }

        if (totalAmountDue === null || totalAmountDue === 0) {
            throw new BadRequestError('No unpaid jobs available. Cannot deposit money.');
        }

        // Calculate maximum deposit allowed (25% of total amount due)
        const maxDeposit = totalAmountDue * 0.25;
        if (amount > maxDeposit) {
            throw new BadRequestError(`Cannot deposit more than 25% of total jobs due: ${maxDeposit}`);
        }
    };


    /**
     * Validate date range 
     * @param {string} start - Start date
     * @param {string} end - End date
     */
    static validateDateRange = (start, end) => {
        if (!start || !end) {
            throw new ValidationError('Start and end dates are required.');
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new ValidationError('Invalid date format. Use YYYY-MM-DD.');
        }

        if (startDate > endDate) {
            throw new ValidationError('Start date must be earlier than or equal to the end date.');
        }
    };

    /**
     * Validate limit 
     * @param {number} limit 
     */
    static validateLimit(limit) {
        if (limit && (isNaN(limit) || limit <= 0)) {
            throw new ValidationError('Limit must be a positive integer.');
        }
    }


}

module.exports = { 
    Validator,
};