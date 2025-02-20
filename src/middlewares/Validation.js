const joi = require('joi');
const { pickOnly } = require('../utils/helpers');
const { ApiError } = require('../utils/errors');

/**
 * 
 * @param {joi.SchemaLike} schema 
 * @param {Array<string>} fields 
 */
function validate(schema, fields) {
    return  async (req,res,next) => {
        try {
            const values = pickOnly(req,fields);
            const options = { 
                abortEarly: false, 
                allowUnknown: true, 
                stripUnknown: true 
            };
            const compiled = joi.compile(schema);

            const result = await joi.compile(schema).validateAsync(values,options);
            Object.assign(req, result);
            next();
        }
        catch(error) {
            if (error instanceof joi.ValidationError) {
                const msgs = error.details.map(d => d.message);
                throw new ApiError(400, JSON.stringify(msgs));
            }
            else {
                throw error;
            }
        }
    }
}

module.exports = {
    validate,
}