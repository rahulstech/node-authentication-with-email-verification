const { isAsyncFunction } = require('node:util/types');
const http = require('node:http');
const { pickOnly } = require('./helpers');

class AppError extends Error {
    constructor(reason, operational = true, stack = '') {
        super();
        this.name = this.constructor.name;
        this.operational = operational;
        if (typeof reason === 'object') {
            this.reason = pickOnly(reason, ['description', 'details', 'context']);
        }
        else if (typeof reason === 'string') {
            this.reason = { description: reason };
        }
        else {
            this.reason = { description: http.STATUS_CODES[statusCode] };
        }
        if (stack) {
            this.stack = stack;
        }
    }
}

class ApiError extends AppError {
    constructor(statusCode,reason = null,operational = true) {
        super(reason,operational);
        this.statusCode = statusCode;
        this.stack = '';
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