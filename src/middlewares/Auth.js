const passport = require('passport');
const { createToken } = require('../services/AuthenticationService');
const { saveRefreshToken, getUserById } = require('../services/UserService');
const { ApiError } = require('../utils/errors');

function passportAuthenticate(strategy) {
    return (req,res,next) => {
        passport.authenticate(strategy, { session: false }, (error, user, info) => {
            if (error) {
                return next(error);
            }
            if (!user) {
                return next(new ApiError(401,info.message));
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
    const user = req.user;
    const accessToken = createToken(user, process.env.ACCESS_TOKEN_EXPIRY);
    const refreshToken = createToken(user, null);

    const saved = await saveRefreshToken(user.id, refreshToken);
    if (!saved) {
        throw new ApiError(500, 'refresh token not saved');
    }

    res.json({ tokens: { accessToken, refreshToken }});
}

async function issueNewAccessToken(req, res) {
    const { id } = req.user ||  {}

    // check user has the refresh token
    const user = await getUserById(id)

    // if user does not exists in cache means user not logged in
    if (!user) {
        throw new ApiError(404, 'user not found');
    }

    // refresh toke is valid, issue a new access token
    const accessToken = createToken(user, process.env.ACCESS_TOKEN_EXPIRY);

    res.status(200).json({ accessToken });
}

module.exports = {
    authenticateToken, authenticateEmailPassword, authenticateGoogleLogin, postLogin, issueNewAccessToken,
}