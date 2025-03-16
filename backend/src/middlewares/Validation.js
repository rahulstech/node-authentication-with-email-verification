const { AppError } = require('../utils/errors');
const { validateValueBySchema } = require('../utils/helpers');

/**
 * 
 * @param {object} schemas 
 * @param {Array<string>} fields 
 * @param {string} label
 */
function validate(schemas, fields, label = 'invalid value') {
    return  async (req,res,next) => {
        const options = { 
            abortEarly: false, 
            allowUnknown: true, 
        };
        
        for (let field of fields) {
            if (!Object.hasOwn(schemas, field)) {
                throw new AppError( { 
                    description: `no schema found for '${field}'`,
                    context: {
                        filename: __filename,
                        method: 'validate',
                        "arg.schemas": Object.keys(schemas),
                        "arg.fields": fields
                    },
                    }, false);
            }

            const schema = schemas[field].prefs(options);
            const values = req[field];
            const result = await validateValueBySchema(
                schema, values, 
                { type: 'ApiError', description: label, statusCode: 400 }
            );
            req[field] = result;
        }
        next();
    }
}

module.exports = {
    validate, 
}