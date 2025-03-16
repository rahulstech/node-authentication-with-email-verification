const { getUserByEmail, createUser, setEmailVerified, getUserById, setEmail, setPassword, saveRefreshToken } = require('../services/UserService');
const { save, get, setHash } = require('../services/CacheService');
const { sendEmail } = require('../services/EmailService');
const { ApiError } = require('../utils/errors');
const { hashPassword, verifyPassword } = require('../utils/helpers');
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
    await sendEmailForEmailVerification(user)
    
    // redirect to login
    res.status(201).json({ data: user });
}

async function sendEmailForEmailVerification({ id, email }) {
    const verificationCode = crypto.randomBytes(32).toString('base64url')

    // cache the verification code for 15 minutes
    // i never need to manually delete this value even after successful email verification
    // because it's expiration is set so it will be remove automactically
    // also setting new value before expiration of old value resets the expiration
    // thus i saved an execution just avoiding deletion
    await save(`user:${id}:verify:email`, verificationCode, 900);

    // send verification code via email
    const url = new URL('/verify/email',`http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
    url.searchParams.append('code',verificationCode);
    url.searchParams.append('uid',id);
    const emailVerificationLink = url.href;

    await sendEmail(email, `Verify Email`, `Please click the link to verify your email\n${emailVerificationLink}\n
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

async function sendVerificationEmail(req,res) {
    const { id } = req.user;
    const user = await getUserById(id);
    if (null === user) {
        throw new ApiError(404, `user not found`);
    }

    // if user is already verified then no need to send verification email
    if (user.verified) {
        return res.json({ message: "email already verified" });
    }

    await sendEmailForEmailVerification(user);
    res.json({ message: 'verification email sent'});
}

async function updateEmail(req,res) {
    const { id } = req.user;
    const { newEmail, password } = req.body;

    // check email already exists
    const anotherUser = await getUserByEmail(newEmail);
    if (null !== anotherUser) {
        if (anotherUser.id === id) {
            return res.json({ message: "old email and new email are same" });
        }
        else {
            throw new ApiError(403, "email already taken");
        }
    }

    const user = await getUserById(id);

    // verify password
    const matched = await verifyPassword(password, user.password);
    if (!matched) {
        throw new ApiError(401, "incorrect password");
    }

    // update email in db
    const changed = await setEmail(id, newEmail);
    if (!changed) {
        throw new ApiError(500, "email not saved");
    }

    // send verification email
    await sendEmailForEmailVerification(user);

    res.json({ message: "email changed" });
}

async function logout(req, res) {
    const { id } = req.user
    if (id) {
        await saveRefreshToken(id, null);
    }

    res.status(200).json({ message: 'logged out' })
}

module.exports = { 
    registerUser, verifyEmail, sendVerificationEmail, logout, updateEmail,
}