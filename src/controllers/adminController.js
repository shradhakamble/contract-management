const adminService = require('../services/adminService');
const { NotFoundError } = require('../utils/errors');


/**
 * Fetch the best profession based on the provided date range.
 * @route GET /api/admin/best-profession
 * @returns Best Profession
 */
const getBestProfession = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const bestProfession = await adminService.findBestProfession(start, end);

        res.status(200).json({ bestProfession });
    } catch (error) {
        console.error('Error while getting best profession: ', error);
        next(error);
    }
};


/**
 * Get the best clients who paid the most for jobs within the specified time period.
 * @route GET /api/admin/best-clients
 * @returns Best Client
 */
const getBestClients = async (req, res, next) => {
    try {
        const { start, end, limit = 2 } = req.query;
        const bestClients = await adminService.fetchBestClients(start, end, limit);

        res.status(200).json({ bestClients });
    } catch (error) {
        console.error('Error while getting best client : ', error);
        next(error);
    }
};


module.exports = { 
    getBestProfession,
    getBestClients,
};
