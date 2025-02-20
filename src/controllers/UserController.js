const { getUserByEmail, createUser, setEmailVerified, getUserById } = require('../services/UserService');
const { save, get, setHash } = require('../services/CacheService');
const { sendEmail } = require('../services/EmailService');
const { ApiError } = require('../utils/errors');
const { hashPassword } = require('../utils/helpers');
const crypto = require('node:crypto');

async function registerUser(req, res) {

    const { email, password, displayName } = req.body;

    // check if email already exists
    const existingUser = await getUserByEmail(email)
    if (null !== existingUser) {
        throw new ApiError(403,'email already taken');
    }

    // hash password
    const passwordHash = await hashPassword(password);

    // create new user
    const values = { email, password: passwordHash, displayName };
    const user = await createUser(values);

    // send verification email
    await sendVerificationEmail(user)
    
    // redirect to login
    res.status(201).json({ data: user });
}

async function sendVerificationEmail({ id, displayName, email }) {
    const verificationCode = crypto.randomBytes(32).toString('base64url')

    // cache the verification code for 15 minutes
    // i never need to manually delete this value even after successful email verification
    // because it's expiration is set so it will be remove automactically
    // also setting new value before expiration of old value resets the expiration
    // thus i saved an execution just avoiding deletion
    await save(`user:${id}:verify:email`, verificationCode, 15 * 60);

    // send verification code via email
    await sendEmail(email, `Verify Email`, `Welcome ${displayName}.\nPlease click the link to verify your email
        http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/verify/email?code=${verificationCode}&uid=${id}\n
        This link is valid for 15 minutes.`);
}

async function verifyEmail(req, res) {
    const { code, uid } = req.query
    if (!code || !uid) {
        return res.status(400).send('invalid verification link. email not verified')
    }

    // if the user is late then the code is already expired in cache,
    const verificationCode = await get(`user:${uid}:verify:email`)
    if (!verificationCode) {
        throw new ApiError(401, 'email verification link expired');
    }

    // for some reason user received the old email and meanwhile clicked for new code
    // in that case cached code and emailed code will not be same
    if (code !== verificationCode) {
        throw new ApiError(401, 'incorrect email verification link');
    } 

    // if verified update verified status in db
    await setEmailVerified(uid, true);

    // update cached user if exists
    await setHash(`user:${uid}`, 'verified', 1, true);

    res.status(200).json({ message: 'email verified'});
}

async function sendNewVerificationEmail(req,res) {
    const { id } = req.user;
    const user = await getUserById(id);
    if (null === user) {
        throw new ApiError(404, `user not found`);
    }

    await sendVerificationEmail(user);
    res.json({ message: 'verification email sent'});
}

async function logout(req, res) {
    const { id } = req.user || {}
    if (id) {
        await saveRefreshToken(id, null);
    }

    res.status(200).json({ message: 'logged out' })
}

module.exports = { 
    registerUser, verifyEmail, sendNewVerificationEmail, logout,
}