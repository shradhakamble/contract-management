const contractRepository = require('../repositories/contractRepository');

/**
 * Fetch a contract by ID
 * @param {number} contractId - ID of the contract
 * @param {number} profileId - ID of the authenticated user
 * @returns {object|null} - Contract object or null
 */
const getContractById = async (contractId, profileId) => {
    return await contractRepository.findContractByIdAndProfile(contractId, profileId);
};


/**
 * Fetch all active contracts for a profile
 * @param {number} profileId - Id of the authenticated user
 * @returns {Promise<Array>} - List of active contracts
 */
const getActiveContracts = async (profileId) => {
    return await contractRepository.findAllActiveContractsByProfile(profileId);
};


module.exports = { 
    getContractById,
    getActiveContracts,
};