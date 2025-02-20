const joi = require('joi');

const registerUserRule = {
    schema: {
        body: joi.object().keys({
            email: joi.string().email().required(),
            password: joi.string().required(),
            displayName: joi.string().required(),
        })
        .required()
        .unknown(false),
    },

    fields: ['body'],
};

const loginUserRule = {
    schema: {
        body: joi.object().keys({
            email: joi.string().email().required(),
            password: joi.string().required(),
        })
        .required()
        .unknown(false),
    },

    fields: ['body'],
};

const verifyEmailRule = {
    schema: {
        query: joi.object().keys({
            uid: joi.number().integer().required(),
            code: joi.string().required(),
        })
        .required()
        .unknown(false),
    },

    fields: ['query'],
}

module.exports = {
    registerUserRule, loginUserRule, verifyEmailRule, 
}