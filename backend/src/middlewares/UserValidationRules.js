const joi = require('joi');

const passwordSchema = joi.string().min(8).max(32);

const registerUserRule = {
    schema: {
        body: joi.object().keys({
            email: joi.string().email().required(),
            password: passwordSchema.required(),
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

const updateEmailRule = {
    schema: {
        body: joi.object().keys({
            password: joi.string().required(),
            newEmail: joi.string().email().required(),
        })
        .required()
        .unknown(false),
    },

    fields: ['body'],
};

const updatePasswordRule = {
    schema: {
        body: joi.object().keys({
            password: passwordSchema.required(),
            newPassword: passwordSchema.required(),
        })
        .required()
        .unknown(false),
    },

    fields: ['body'],
};

const passwordResetLinkRule = {
    schema: {
        body: joi.object().keys({
            email: joi.string().email().required(),
        })
        .required()
        .unknown(false),
    },
    fields: ['body'],
};

const passwordResetRule = {
    schema: {
        query: joi.object().keys({
            "Reset-Token": joi.string().required(),
        })
        .required(),
        body: joi.object().keys({
            password: passwordSchema.required(),
            confirmPassword: passwordSchema.required(),
        })
        .required()
        .unknown(false),
    },
    fields: ['query','body'],
};

module.exports = {
    registerUserRule, loginUserRule, verifyEmailRule, updateEmailRule, updatePasswordRule, passwordResetLinkRule,
    passwordResetRule,
}