const { Contract } = require('../model');
const { Sequelize } = require('sequelize');

/**
 * Fetch a contract by ID and profile
 * @param {number} contractId - Id of the contract
 * @param {number} profileId - Id of the authenticated user
 * @returns {object|null} - Contract object or null
 */
const findContractByIdAndProfile = async (contractId, profileId) => {
    return await Contract.findOne({
        where: {
            id: contractId,
            [Sequelize.Op.or]: [
                { ClientId: profileId },
                { ContractorId: profileId },
            ],
        },
    });
}


/**
 * Fetch all active contracts for a profile
 * @param {number} profileId - Id of the authenticated user
 * @returns {Promise<Array>} - List of active contracts
 */
const findAllActiveContractsByProfile = async (profileId) => {
    return await Contract.findAll({
        where: {
            [Sequelize.Op.or]: [
                { ClientId: profileId },
                { ContractorId: profileId },
            ],
            status: { [Sequelize.Op.eq]: 'in_progress'} // Select only active contracts
        },
    });
}


module.exports = { 
    findContractByIdAndProfile,
    findAllActiveContractsByProfile,
};