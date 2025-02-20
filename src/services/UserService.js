const { User } = require('../models')
const { saveHash, getHash } = require('./CacheService')

async function createUser({ email, password, displayName, verified }) {
    verified = typeof verified === 'boolean' ? verified : false;
    const newUser = await User.create({ email, password, displayName, verified });
    return newUser.toJSON();
}

async function getUserByEmail(email) {
    const user = await User.findOne({
        raw: true,
        where: { email }
    })
    if (user) {
        return user;
    }
    return null;
}

async function getUserById(id) {
    const user = await User.findOne({
        raw: true,
        where: { id },
    })
    if (user) {
        return user;
    }
    return null;
}

async function saveRefreshToken(userId, refreshToken ) {
    const [count] = await User.update({ refreshToken }, { where: { id: userId } })
    return count === 1
}

async function isRefreshTokenValid(userId, refreshToken) {
    const user = await User.findOne({
        raw: true,
        where: {
            id: userId,
            refreshToken
        }
    })
    return user ? true : false
}

async function setEmailVerified(userId, verified) {
    const user = await User.findOne({ where: { id: userId }})
    await user.update({ verified })
    return user.toJSON();
}

module.exports = {
    createUser, getUserByEmail, saveRefreshToken, isRefreshTokenValid, getUserById, setEmailVerified,
}