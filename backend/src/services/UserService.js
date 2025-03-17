const joi = require('joi');
const { getCachedUserById, cacheUser, getCachedUserByEmail, setUser, setUserRefreshToken, setUserEmail, getUserRefreshToken, removeUserRefreshToken } = require('./UserCacheService');
const { findUserById, findUserByEmail, updateUser, insertUser } = require('./UserDBService');
const { validateValueBySchema } = require('../utils/helpers');


const __schema_user = joi.object({

    id: joi.number().integer(),
    email: joi.string().email(),
    password: joi.string().empty([null,'']).default(null),
    displayName: joi.string(),
    refreshToken: joi.string().empty('').default(null),
    verified: joi.number().custom(value => value !== 0),

}).prefs({ convert: true });


async function convertUser(values, description = 'UserService.convertUser') {
    const converted = await validateValueBySchema(__schema_user, values, { description });
    return converted;
}

async function createUser({ email, password, displayName, verified }) {
    // insert user in db 
    const newUser = await insertUser({ email, password, displayName, verified });
    // cache user
    await cacheUser({ email, password, displayName, verified });
    // convert user
    const user = await convertUser(newUser, 'UserService.createUser');
    return user;
}

async function getUserByEmail(email) {

    // get from cache
    let cached = await getCachedUserByEmail(email);

    // if not found in cache, get from db
    if (!cached) {
        const user = await findUserByEmail(email);
        if (!user) {
            return null;
        }

        // if found cache the user
        await cacheUser(user);
        cached = user;
    }
    const converted = await convertUser(cached, 'UserService.getUserByEmail');
    return converted;
}

async function getUserById(id) {

    // try to get cached used 
    let cached = await getCachedUserById(id);

    // if not found get user from db
    if (!cached) {
        const user = await findUserById(id);
        if (!user) {
            return null;
        }

        // if found cache user
        await cacheUser(user);
        cached = user;
    }
    const converted = await convertUser(cached, 'UserService.getUserById');
    return converted;
}

async function saveRefreshToken(userId, refreshToken, expirsIn) {
    // save refresh token in cache
    return await setUserRefreshToken(userId, refreshToken, expirsIn); 
}

async function removeRefreshToken(id) {
    // remove refresh token from cache
    await removeUserRefreshToken(id);
}

async function isRefreshTokenValid(userId, refreshToken) {
    
}

async function getRefreshToken(id) {
    // get token from cache
    const refreshToken = await getUserRefreshToken(id);
    return refreshToken;
}

async function setEmailVerified(id, verified) {
    // update verified in db
    await updateUser(id, { verified });
    // update verified in cache
    await setUser(id, { verified });
}

async function setEmail(id, email, verified = false) {
    // update email in db
    await updateUser(id, { email, verified });
    // update email in cache
    await setUserEmail(id, email, verified);
}

async function setPassword(id, password) {
   // update password in db
   await updateUser(id,{ password });
   // update password in cache
   await setUser(id,{ password });
}

module.exports = {
    createUser, getUserByEmail, saveRefreshToken, isRefreshTokenValid, getUserById, setEmailVerified,
    setEmail, setPassword, getRefreshToken, removeRefreshToken, 
}