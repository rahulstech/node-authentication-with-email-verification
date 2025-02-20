const { isAsyncFunction } = require('node:util/types');
const http = require('node:http');

class AppError extends Error {
    constructor(message, operational = true, stack = '') {
        super(message);
        this.name = this.constructor.name;
        this.operational = operational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

class ApiError extends AppError {
    constructor(statusCode,message = '',operational = true) {
        super(null,operational);
        this.statusCode = statusCode;
        this.message = message || http.STATUS_CODES[statusCode];
    }
}

function catchErrorAsync(fn) {
    let task = fn;
    if (!isAsyncFunction(task)) {
        task = async (req,res,next) => {
            return fn(req,res,next);
        }
    }
    return (req,res,next) => {
        task(req,res,next)
        .catch(err => next(err));
    }
}

module.exports = { 
    AppError, ApiError, catchErrorAsync,
}