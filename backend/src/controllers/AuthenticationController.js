const passport = require('passport');
const { createToken } = require('../services/AuthenticationService');
const { saveRefreshToken, getUserById, setPassword, getUserByEmail } = require('../services/UserService');
const { ApiError } = require('../utils/errors');
const { sendEmail } = require('../services/EmailService');
const { hashPassword } = require('../utils/helpers');

function passportAuthenticate(strategy) {
    return (req,res,next) => {
        passport.authenticate(strategy, { session: false }, (error, user, info) => {
            if (error) {
                return next(error);
            }
            req.user = user;
            next();
        })(req,res,next);
    }
}

const authenticateToken = passportAuthenticate('jwt');

const authenticateEmailPassword = passportAuthenticate('local');

const authenticateGoogleLogin = passportAuthenticate('google');

async function postLogin(req,res) {
    const { id } = req.user;
    const user = await getUserById(id);
    const accessToken = await createToken(user, process.env.ACCESS_TOKEN_EXPIRY);
    const refreshToken = await createToken(user, process.env.REFRESH_TOKEN_EXPIRY);

    const saved = await saveRefreshToken(id, refreshToken.token);
    if (!saved) {
        throw new ApiError(500, 'refresh token not saved');
    }

    res.json({ 
        tokens: { "access-token": accessToken, "refresh-token": refreshToken },
        user,
    });
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
    const accessToken = createToken(user, process.env.ACCESS_TOKEN_EXPIRY);

    res.status(200).json({ accessToken });
}

async function sendPasswordResetLinkEmail(req,res) {
    const { email } = req.body

    // get user by email
    const user = await getUserByEmail(email);
    if (user === null) {
        throw new ApiError(404, "incorrect email");
    }

    // generate very short lived jwt for user
    const token = createToken(user, process.env.PASSWORD_RESET_TOKEN_EXPIRY, '5s'); 

    // send a link to email
    const url = new URL('/password/reset',`http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
    url.searchParams.append('Reset-Token',token);

    const resetLink = url.href;
    const subjectText = "Rest Password";
    const messageText = `You password reset link is below\n${resetLink}\nIf you did not request for password reset don't click the link`;

    await sendEmail(email, subjectText, messageText);

    res.json({ message: "password reset link sent"});
}

async function resetPassword(req,res) {
    const { id } = req.user;
    const { password } = req.body;

    // hash password
    const hash = await hashPassword(password);

    // save hashed password in db
    await setPassword(id, hash);

    res.json({ message: "password reset" });
}

async function updatePassword(req,res) {
    const { id } = req.user;
    const { password, newPassword } = req.body;

    // get user by id
    const user = await getUserById(id);
    
    // verify current password
    const matched = await verifyPassword(password, user.password);
    if (!matched) {
        throw new ApiError(401, "incorrect password");
    }

    // if password verified, create new hash password and update in db
    const hash = await hashPassword(newPassword);
    await setPassword(id, hash);

    res.json({ message: "password changes" });
}

module.exports = {
    authenticateToken, authenticateEmailPassword, authenticateGoogleLogin, postLogin, issueNewAccessToken, 
    sendPasswordResetLinkEmail, resetPassword, updatePassword,
}