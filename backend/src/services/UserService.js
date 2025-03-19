const joi = require('joi');
const { getCachedUserById, cacheUser, getCachedUserByEmail, setUser, setUserRefreshToken, setUserEmail, 
    removeUserRefreshToken, setCodeForEmailVerification, getCodeForEmailVerification } = require('./UserCacheService');
const { findUserById, findUserByEmail, updateUser, insertUser } = require('./UserDBService');
const { pickOnly } = require('../utils/helpers');
const { validateValueBySchema } = require('../utils/validation');


const CACHEABLE_FILEDS = ['id', 'password', 'email', 'displayName', 'verified'];

const __schema_user = joi.object({

    id: joi.number().integer(),
    email: joi.string().email(),
    password: joi.string().empty([null,'']).default(null),
    displayName: joi.string(),
    refreshToken: joi.string().empty([null,'']).default(null),
    verified: joi.number().custom(value => value !== 0),

}).prefs({ convert: true, abortEarly: false, allowUnknown: true, stripUnknown: true });


async function convertUser(values, location = 'convertUser') {
    const converted = await validateValueBySchema(__schema_user, values, 
        { description:  `UserService.${location}`});
    return converted;
}

async function createUser({ email, password, displayName, verified = false }) {
    // insert user in db 
    const newUser = await insertUser({ email, password, displayName, verified });
    // cache user
    const newCachedUser = await cacheUser(pickOnly(newUser, CACHEABLE_FILEDS));
    // convert user
    const converted = await convertUser(newCachedUser, 'createUser');
    return converted;
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
        await cacheUser(pickOnly(user, CACHEABLE_FILEDS));
        cached = user;
    }
    const converted = await convertUser(cached, 'getUserByEmail');
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
        cached = await cacheUser(pickOnly(user,CACHEABLE_FILEDS));
    }
    const converted = await convertUser(cached, 'getUserById');
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

async function setEmailVerificationCode(id, code, expiresIn) {
    return setCodeForEmailVerification(id, code, expiresIn);
}

async function getEmailVerificationCode(id) {
    const code = await getCodeForEmailVerification(id);
    return code;
}

module.exports = {
    createUser, getUserByEmail, saveRefreshToken, getUserById, setEmailVerified,
    setEmail, setPassword, removeRefreshToken, setEmailVerificationCode, getEmailVerificationCode,
}