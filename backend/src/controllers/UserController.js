const { createToken } = require('../services/AuthenticationService');
const { getUserByEmail, createUser, setEmailVerified, getUserById, setEmail, 
    setPassword, saveRefreshToken, removeRefreshToken, 
    setEmailVerificationCode,
    getEmailVerificationCode} = require('../services/UserService');
const { sendEmail } = require('../services/EmailService');
const { ApiError } = require('../utils/errors');
const { hashPassword, verifyPassword, pickOnly, formatSeconds, getGMTSecondsDifferenceFromNow } = require('../utils/helpers');
const crypto = require('node:crypto');
const passport = require('passport');
const { jwtSignAsync, jwtVerifyAsync } = require('../utils/secret');

// passport authentication middlewares 

const authenticateToken = (req,res,next) => { 
    passport.authenticate('jwt', (error, user, info) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            return next(new ApiError(401))
        }
        req.user = user;
        next();
    })(req,res,next);
}

const authenticateEmailPassword = passport.authenticate('local', { session: false });

const authenticateGoogleLogin = passport.authenticate('google', { session: false });

async function prepareLoginReponse(user) {
    const accessToken = await createToken(user, process.env.ACCESS_TOKEN_EXPIRY);
    const refreshToken = await createToken(user, process.env.REFRESH_TOKEN_EXPIRY);
    const expiresIn = getGMTSecondsDifferenceFromNow(refreshToken.expire);

    const saved = await saveRefreshToken(user.id, refreshToken.token, expiresIn);
    if (!saved) {
        throw new ApiError(500, 'refresh token not saved');
    }

    const userDetails = pickOnly(user,["id", "email", "displayName", "verified"]);
    userDetails.hasPassword = Boolean(user.password);

    return { 
            tokens: { "access-token": accessToken, "refresh-token":  refreshToken },
            user: userDetails,
    };
}

// register new user
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
    await sendEmailForEmailVerification(user);

    // prepare login response
    const response = await prepareLoginReponse(user);
    
    res.status(201).json(response);
}

// handle user login
async function loginUser(req,res) {
    // get user by id
    const user = await getUserById(req.user.id);
    
    // prepare login response
    const response = await prepareLoginReponse(user);

    res.json(response);
}

async function issueNewAccessToken(req, res) {
    const { id } = req.user;

    // check user has the refresh token
    const user = await getUserById(id)

    // if user does not exists in cache means user not logged in
    if (!user) {
        throw new ApiError(404, {
            description: 'user not found',
            context: {
                user_id: id
            },
        });
    }

    // refresh toke is valid, issue a new access token
    const accessToken = await createToken(user, process.env.ACCESS_TOKEN_EXPIRY);

    res.json({ "access-token": accessToken });
}

async function sendPasswordResetLinkEmail(req,res) {
    const { email } = req.body

    // get user by email
    const user = await getUserByEmail(email);
    if (user === null) {
        throw new ApiError(404, {
            details: [{ explain: "incorrect email", key: "email" }],
        });
    }

    // generate very short lived jwt for user
    const { token, expire } = await createToken(user, process.env.PASSWORD_RESET_TOKEN_EXPIRY); 
    const expiresIn = getGMTSecondsDifferenceFromNow(expire);

    // send a link to email
    const url = new URL('',process.env.PASSWORD_RESET_URL);
    url.searchParams.append('Reset-Token',token);
    const resetLink = url.href;
    const subjectText = 'Reset Password';
    const messageText = `You password reset link is below:\n${resetLink}\nThis link will expire in ${formatSeconds(expiresIn)}. If you did not request for password reset don't click the link`;

    await sendEmail(email, subjectText, messageText);

    res.sendStatus(200);
}

async function resetPassword(req,res) {
    const { id } = req.user;
    const { password } = req.body;

    // hash password
    const hash = await hashPassword(password);

    // save hashed password in db
    await setPassword(id, hash);

    res.sendStatus(200);
}

async function updatePassword(req,res) {
    const { id } = req.user;
    const { password, newPassword } = req.body;

    // get user by id
    const user = await getUserById(id);
    
    // verify current password
    const matched = await verifyPassword(password, user.password);
    if (!matched) {
        throw new ApiError(403, {
            details: [
                { explain: "incorrect password", key: "password" }
            ]
        });
    }

    // if password verified, create new hash password and update in db
    const hash = await hashPassword(newPassword);
    await setPassword(id, hash);

    res.sendStatus(200);
}

async function sendEmailForEmailVerification({ id, email, displayName }) {
    // generate randome code
    const verificationCode = crypto.randomBytes(32).toString('base64url');

    // generate token
    const payload = {
        code: verificationCode,
        sub: id,
    };
    const options = {
        expiresIn: process.env.EMAIL_VERIFICATION_EXPIRY
    }
    const { token, expire } = await jwtSignAsync(payload, options);
    const expiresIn = getGMTSecondsDifferenceFromNow(expire);

    // cache the verification code for 15 minutes
    // i never need to manually delete this value even after successful email verification
    // because it's expiration is set, so it will be removed automactically
    // also setting new value before expiration of old value resets the expiration
    // thus i saved an execution just avoiding deletion
    if (! await setEmailVerificationCode(id, verificationCode, expiresIn)) {
        throw new ApiError(500, 'email verification code not saved')
    }

    // send verification code via email
    const url = new URL("",process.env.EMAIL_VERIFICATION_URL);
    url.searchParams.append('token', token);
    const emailVerificationLink = url.href;

    const subject = 'Verify Email';
    const body = `Welcome ${displayName}. Please click the link to verify your email\n${emailVerificationLink}\n
        This link is valid for ${formatSeconds(process.env.EMAIL_VERIFICATION_EXPIRY)}.`

    await sendEmail(email, subject, body);
}

async function verifyEmail(req, res) {
    const { token } = req.query
    if (!token) {
        throw new ApiError(400,'invalid link, email not verified');
    }

    // verify token
    const { code, sub: uid } = await jwtVerifyAsync(token);

    // if the user is late then the code is already expired
    const verificationCode = await getEmailVerificationCode(uid);
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

    res.sendStatus(200);
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
    const { id } = req.user;
    await removeRefreshToken(id);

    res.sendStatus(204);
}

module.exports = { 

    authenticateToken, authenticateEmailPassword, authenticateGoogleLogin,
    registerUser, verifyEmail, sendVerificationEmail, updateEmail, logout, loginUser, issueNewAccessToken,
    updatePassword, resetPassword, sendPasswordResetLinkEmail
}