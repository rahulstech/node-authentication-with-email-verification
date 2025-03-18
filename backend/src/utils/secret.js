const jwt = require('jsonwebtoken');
const path = require('node:path');
const { readFileSync } = require('node:fs');

// public key to verify the token
const JWT_PUBILIC_KEY = readFileSync(path.resolve(__dirname, '../..', process.env.JWT_PUBLIC_KEY));

// private key to sign the token
const JWT_PRIVATE_KEY = readFileSync(path.resolve(__dirname, '../..', process.env.JWT_PRIVATE_KEY));

// jwt asymmetric algorithm
const JWT_ALGORITHM = process.env.JWT_ALGORITHM;

const JWT_DEFAULT_OPTIONS = { algorithm: JWT_ALGORITHM };

function convertDuration(value) {
    const type = typeof value;
    if (type === 'string') {

        return value;
    }
    if (type === 'number') {
        return `${expiresIn}s`;
    }
    return undefined;
}

function prepareSignOptions(options) {
    // Ensure options is an object to prevent errors
    const userOptions = options || {};

    // Merge default options with provided options (user options take precedence)
    const mergedOptions = { ...JWT_DEFAULT_OPTIONS, ...userOptions };

    // Convert duration values only if they exist
    if (mergedOptions.expiresIn) {
        mergedOptions.expiresIn = convertDuration(mergedOptions.expiresIn);
    }
    if (mergedOptions.notBefore) {
        mergedOptions.notBefore = convertDuration(mergedOptions.notBefore);
    }

    // Remove falsy values (undefined, null) for valid JWT options
    return Object.fromEntries(
        Object.entries(mergedOptions).filter(([_, value]) => value !== null && value !== undefined)
    );
}


function jwtSignAsync(payload, options = null) {
    return new Promise((resolve, reject)=> {
        const validOptions = prepareSignOptions(options);
        jwt.sign(payload, JWT_PRIVATE_KEY, validOptions, (error, token) => {
            if (error) {
                reject(error);
            }
            const { exp , iat } = jwt.decode(token, { json: true });
            const result = { token, expire: exp || 0 };
            resolve(result);
        });
    });
}

function jwtVerifyAsync(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_PUBILIC_KEY, { algorithms: JWT_ALGORITHM }, (error, payload) => {
            if (error) {
                return reject(error);
            }
            resolve(payload);
        });
    });
}

module.exports = { JWT_PUBILIC_KEY, JWT_PRIVATE_KEY, jwtSignAsync, jwtVerifyAsync }