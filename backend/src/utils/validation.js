const { AppError, ApiError } = require("./errors");

const DEFAULT_VALIDATION_OPTIONS = { 
    description: 'validation error', statusCode: 500, isOperational: true 
};

async function validateValueBySchema(schema, value, options = DEFAULT_VALIDATION_OPTIONS) {
    try {
        const result = await schema.validateAsync(value);
        return result;
    }
    catch(error) {
        if (error.name === 'ValidationError') {
            let mergesOptions = options ? { ...DEFAULT_VALIDATION_OPTIONS, ...options } : DEFAULT_VALIDATION_OPTIONS;
            throw convertValidationError(error,mergesOptions);
        }
        throw error;
    }
}

function convertValidationError(error, options = null) {
    const details = error.details.map(err => ({
        explain: err.message,
        key: err.context.key,
    }));
    const isOperational = options.isOperational;
    const statusCode = options.statusCode ;
    const reason = { details };
    if (options?.description) {
        reason.description = options?.description;
    }
    return new ApiError(statusCode, reason, isOperational);
}

module.exports = { validateValueBySchema }