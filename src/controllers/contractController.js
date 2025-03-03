const contractService = require('../services/contractService');
const { NotFoundError } = require('../utils/errors');
const { InternalServerError } = require('../utils/errors');

/**
 * Fetch a contract by ID
 * Ensure the authenticated user is either the client or contractor 
 * @route GET /api/contracts/:id
 * @returns contract by id
 */
const getContractById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const profile = req.profile;

        // Retrieve the contract and ensure it belongs to the profile making the request
        const contract = await contractService.getContractById(id, profile.id);

        if (!contract) {
            throw new NotFoundError('Contract not found or not accessible');
        }

        return res.json(contract);
    } catch (error) {
        console.error('Error fetching contract : ', error);
        return next(new InternalServerError(error)); // Forward error to middleware
    }
};


/**
 * Fetch all active contracts for a user
 * @route GET /api/contracts
 * @returns active contracts
 */
const getAllActiveContracts = async (req, res, next) => {
    try {
        const profile = req.profile;

        // Call the service layer to get the contracts
        const contracts = await contractService.getActiveContracts(profile.id);

        // Check if contracts is null or undefined and ensure it's an array
        if (!contracts) {
            return res.json([]); // Return an empty array if no contracts found
        }

        return res.json(contracts);
    } catch (error) {
        console.error('Error fetching active contracts : ', error);
        return next(new InternalServerError(error));
    }
}


module.exports = { 
    getContractById,
    getAllActiveContracts,
};