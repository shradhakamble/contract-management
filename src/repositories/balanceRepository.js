const { Job, Contract, Profile } = require('../model');
const { Sequelize } = require('sequelize');
const { NotFoundError } = require('../utils/errors');


/**
 * Find profile by ID
 * @param {number} userId - Id of the profile to fetch
 * @returns {Promise<Profile>} - Profile object
 */
const findById = async (userId, transaction) => {
    const profile = await Profile.findByPk(userId, { transaction });

    if (!profile) {  
        throw new NotFoundError('Profile not found');
    }

    return profile;
};

/**
 * Update client's balance
 * @param {Profile} client - The client profile with updated balance
 * @returns {Promise<string>}
 */
const updateBalance = async (client, transaction) => {
    await client.save({ transaction });
}


/**
 * Repository to fetch all unpaid jobs for a profile
 * @param {number} profileId - Id of the authenticated user
 * @returns {Promise<Array>} - List of unpaid jobs
 */
const findDepositMoney = async (userId, transaction) => {
    return await Job.sum('price', {
        include: [
            {
            model: Contract,
            where: {
                ClientId: userId,
                status: 'in_progress'
            }
            }
        ],
        where: { paid: { [Sequelize.Op.not]: true } },
        transaction,
        lock: transaction.LOCK.UPDATE, // Apply row-level locking
    });
};


module.exports = {
    findById,
    updateBalance,
    findDepositMoney,

};