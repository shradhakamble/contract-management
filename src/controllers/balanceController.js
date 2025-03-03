const balanceService = require('../services/balanceService'); // Import balance service
const { BadRequestError } = require('../utils/errors');


/**
 * Deposit money into a client's balance
 * @route POST /api/balances/deposit/:userId
 * @access Client only
 * @returns Success/Failure
 */
const depositMoney = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10); // Get userId from request parameters
        const { amount } = req.body; // Get amount from request body

        // Ensure the authenticated user can only deposit to their own account
        if (req.profile.id !== userId) {
            throw new BadRequestError('Unauthorized to deposit to this account');
        }

        const message = await balanceService.depositMoney(userId, amount);
        return res.status(200).json({ message });
    } catch (error) {
        console.error('Error while depositing money : ', error);
        return next(error); 
    }
};

module.exports = {
    depositMoney,
};
