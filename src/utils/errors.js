class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized Access') {
        super(message, 401);
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}

class InternalServerError extends AppError {
    constructor(message = 'Internal server error'){
        super(message, 500);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}

module.exports = {
    AppError, 
    NotFoundError, 
    UnauthorizedError,
    BadRequestError, 
    InternalServerError,
    ValidationError,
};