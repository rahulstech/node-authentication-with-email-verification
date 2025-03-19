const { validateValueBySchema } = require('../../../../../../Desktop/nodejs-portfolio-projects/node-express-auth/backend/src/utils/validation');
const { getHash, saveHash, save, get, remove } = require('./CacheService');
const joi = require('joi');

const __schema_to_redis = joi.object( {

    id: joi.number().integer(),
    email: joi.string().email(),
    password: joi.string().empty(null).default(''),
    displayName: joi.string(),
    verified: joi.alternatives().try(
        joi.number().integer(),
        joi.boolean().truthy(1).falsy(0).cast('number')
    ),

}).prefs({ convert: true, abortEarly: false, allowUnknown: true, stripUnknown: true });

async function convertUser(values, location = 'convertUser') {
    const converted = await validateValueBySchema(__schema_to_redis, values, 
        { description: `UserCacheService.${location}` });
    return converted;
}

function getUserKey(...data) {
    return `user:${data.join(':')}`;
} 

async function getCachedUserById(id, fields = []) {
    const key = getUserKey(id);
    const value = await getHash(key, fields);
    if (null === value) {
        return null;
    }
    return value;
}

async function getCachedUserByEmail(email, fields = []) {
    const email_key = getUserKey(email);
    const id_key = await get(email_key);
    if (!id_key) {
        return null;
    }

    const cached = await getHash(id_key, fields);
    if (cached === null) {
        return null;
    }
    return cached;
}

async function cacheUser(user) {
    const { id, email } = user;
    const id_key = getUserKey(id);
    const email_key = getUserKey(email);

    // convert user
    const cachable = await convertUser(user, 'cacheUser');
    // save the user with user id key
    await saveHash(id_key, cachable);
    // map user email key to user id key 
    await save(email_key, id_key);
    return cachable;
}

async function setUser(id, newValues) {
    const id_key = getUserKey(id);
    const cachable = await convertUser(newValues, 'setUser');
    await saveHash(id_key, cachable);
}

async function setUserEmail(id, newEmail, verified = false) {
    const id_key = getUserKey(id);
    // get the old email
    const { email: old_email } = await getHash(id_key, ['email']) || {};
    // if old email exists remove the user email-id key-value pair
    if (old_email) {
        const old_email_key = getUserKey(old_email);
        await remove(old_email_key);
    }
    // save new email
    await setUser(id, { email: newEmail, verified });
    // create new user email-id key-value pair
    const email_key = getUserKey(newEmail);
    await save(email_key, id_key);
}

async function setCodeForEmailVerification(id, code, expiresIn) {
    const key = getUserKey(id,'verify','email');
    // save code in cache
    return await save(key, code, expiresIn);
}

async function getCodeForEmailVerification(id) {
    const key = getUserKey(id,'verify','email');
    const code = await get(key);
    if (!code) {
        return null;
    }
    return code;
}

async function setUserRefreshToken(id, refreshToken, expirsIn) {
    const key = getUserKey(id, 'refreshToken');
    return await save(key, refreshToken, expirsIn)
}

async function getUserRefreshToken(id) {
    const key = getUserKey(id,'refreshToken');
    const refreshToken = await get(key);
    if (!refreshToken) {
        return null;
    }
    return refreshToken
}

async function removeUserRefreshToken(id) {
    const key = getUserKey(id,'refreshToken');
    return await remove(key);
}

module.exports = {
    getCachedUserById, getCachedUserByEmail, cacheUser, setUser,
    setUserEmail, setCodeForEmailVerification, getCodeForEmailVerification,
    setUserRefreshToken, getUserRefreshToken, removeUserRefreshToken,
}