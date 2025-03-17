const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
    const hashPassword = await bcrypt.hash(plainPassword, Number(process.env.BCRYPT_ROUNDS) || 10)
    return hashPassword
}

async function verifyPassword(plain, hash) {
    return await bcrypt.compare(plain, hash);
}

function pickOnly(src, props, dest = {}) {
    dest = !dest ? {} : dest;
    if (!src || !Array.isArray(props) || props.length === 0) {
        return dest;
    }
    Object.entries(src).forEach(([k,v]) => {
        if (props.includes(k)) {
            dest[k] = v;
        }
    })
    return dest;
}

const DEFAULT_VALIDATION_OPTIONS = { 
    description: 'validation error', statusCode: 400, type: 'ApiError', isOperational: true 
};

async function validateValueBySchema(schema, value, options = DEFAULT_VALIDATION_OPTIONS) {
    try {
        const result = await schema.validateAsync(value);
        return result;
    }
    catch(error) {
        if (error.name === 'ValidationError') {
            throw convertValidationError(error,options);
        }
        throw error;
    }
}

function convertValidationError(error, options = null) {
    const details = error.details.map(err => ({
        explain: err.message,
        key: err.context.key,
    }));
    const isOperational = options?.isOperational || true;
    const reason = { details };
    if (options?.description) {
        reason.description = options?.description;
    }
    if (options?.type === 'ApiError') {
        const statusCode = options?.statusCode || 400;
        return new ApiError(statusCode, reason, isOperational);
    }
    else {
        return new AppError(reason, isOperational);
    }
}

function getGMTNow() {
    const localNow = new Date();
    const tzoffset = localNow.getTimezoneOffset();
    const gmtNow = new Date(localNow.getTime() + tzoffset * 60000);
    return Math.floor(gmtNow.getTime() / 1000);
}

function getGMTTimeDifferenceInSeconds(gmtStart, gmtEnd) {
    return Math.abs(gmtEnd - gmtStart);
}

module.exports = {
    hashPassword, verifyPassword, pickOnly, validateValueBySchema, getGMTNow, getGMTTimeDifferenceInSeconds,
}