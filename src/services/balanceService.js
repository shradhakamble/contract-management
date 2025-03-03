const balanceRepository = require('../repositories/balanceRepository');
const { sequelize } = require('../model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { Validator } = require('../utils/validator');


/**
 * Service to deposit money into a client's balance
 * @param {number} userId - Id of the client
 * @param {number} amount - Amount to deposit
 * @returns {Promise<string>} - Success Message
 */
const depositMoney = async (userId, amount) => {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
        // Fetch the client profile
        const client = await balanceRepository.findById(userId, transaction); 

        if (!client || client.type != 'client') {
            throw new NotFoundError('Client not found');
        }

        const totalAmountDue = await balanceRepository.findDepositMoney(userId, transaction);

        // Validate the deposit amount
        Validator.validateDeposit(totalAmountDue, amount);

        // Update client's balance
        client.balance += amount;
        await balanceRepository.updateBalance(client, transaction);

        // Commit the transaction
        await transaction.commit();

        return 'Deposit Successful.';
    } catch (error) {
        // Rollback the transaction in case of any error
        await transaction.rollback();

        if (error instanceof NotFoundError) {
            throw new NotFoundError(error.message);
        } else {
            throw new BadRequestError(error.message || 'An error occurred during deposit');
        }
    }
};

module.exports = { depositMoney };