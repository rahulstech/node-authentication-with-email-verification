const { isAsyncFunction } = require('node:util/types');
const http = require('node:http');
const { pickOnly } = require('./helpers');

class AppError extends Error {

    constructor(reason, operational = true, stack = '') {
        super();
        this.name = this.constructor.name;
        this.operational = operational;
        this.setReason(reason);
        if (stack) {
            this.stack = stack;
        }
    }

    setReason(reason) {
        if (!reason) {
            this.reason = undefined;
        }
        else if (typeof reason === 'object') {
            this.reason = pickOnly(reason, ['description', 'details', 'context']);
        }
        else if (typeof reason === 'string') {
            this.reason = { description: reason };
        }
        else {
            this.reason = undefined;
        }
    }
}

class ApiError extends AppError {
    constructor(statusCode,reason = null,operational = true) {
        super(null,operational);
        this.statusCode = statusCode;
        this.stack = '';
        if (!reason) {
            this.setReason(http.STATUS_CODES[statusCode]);
        }
        else {
            this.setReason(reason);
        }
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