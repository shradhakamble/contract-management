const { Validator } = require('../utils/validator');
const adminRepository = require('../repositories/adminRepository');


/**
 * Find the best profession in a given date range
 * @param {string} start - Start date in YYYY-MM-DD format
 * @param {string} end - End date in YYYY-MM-DD format
 * @returns {Promise<string>} - Best profession
 */
const findBestProfession = async (start, end) => {

    // Validate input dates
    Validator.validateDateRange(start, end);
    return await adminRepository.getProfessionEarnings(start, end);
};


/**
 * Find the best client in a given date range
 * @param {string} start - Start date
 * @param {string} end - End date
 * @param {number} limit - Limit for the number of clients to return, default is 2
 * @returns {Promise<Array>} - List of best clients
 */
const fetchBestClients = async (start, end, limit) => {

    // Validate input
    Validator.validateDateRange(start, end);
    Validator.validateLimit(limit);
    
    // Fetch best clients from repository
    return await adminRepository.getBestClients(start, end, limit);
};


module.exports = { 
    findBestProfession,
    fetchBestClients,
};
