const { validateValueBySchema } = require('../utils/helpers');
const { getHash, saveHash, save, get, remove } = require('./CacheService');
const joi = require('joi');

const __schema_to_redis = joi.object( {

    id: joi.number().integer(),
    email: joi.string().email(),
    password: joi.string().empty(null).default(''),
    displayName: joi.string(),
    verified: joi.number().integer(),

}).prefs({ convert: true, allowUnknown: true, stripUnknown: true });

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
    const cachable = await validateValueBySchema(__schema_to_redis, user, 
        { description: 'UserCacheService.cacheUser' });
    // save the user with user id key
    await saveHash(id_key, cachable);
    // map user email key to user id key 
    await save(email_key, id_key);
}

async function setUser(id, newValues) {
    const id_key = getUserKey(id);
    const cachable = await validateValueBySchema(__schema_to_redis, newValues,
         { description: 'setUser', ...VALIDATION_OPTIONS});
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

async function setUserRefreshToken(id, refreshToken, expiry) {
    const key = getUserKey(id, 'refreshToken');
    await save(key, refreshToken, expiry)
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
    await remove(key);
}

module.exports = {
    getCachedUserById, getCachedUserByEmail, cacheUser, setUser, setUserEmail, 
    setUserRefreshToken, getUserRefreshToken, removeUserRefreshToken,
}