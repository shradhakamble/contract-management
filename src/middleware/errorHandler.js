const { AppError } = require('../utils/errors');

// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        // Respond with error status code and message
        return res.status(err.statusCode).json({ 
            statusCode: err.statusCode,
            message: err.message 
        });
    }

    console.error('unhandled exception : ', err);

    // For unhandled errors, return a generic message
    res.status(500).json({ 
        statusCode: 500,
        message: 'Something went wrong. Please try again later.' 
    });
};

module.exports = { errorHandler };