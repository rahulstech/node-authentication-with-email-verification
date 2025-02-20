const { readFileSync } = require('node:fs');
const path = require('node:path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('./UserService');
const { verifyPassword, pickOnly } = require('../utils/helpers');

// google oauth credentials
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

// install google oauth strategy for signin via google

function installGoogleOauthStrategy(passport) {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/google/callback',
        scope: ['profile','email'],
    }, async (accessToken, refreshToken, profile, done) => {
        const [{value: email}] = profile.emails;
        const displayName = profile.displayName;

        try {
            // find user by email
            let user = await getUserByEmail(email);

            // create new user if does not exists
            if (user === null) {
                user = await createUser({ email, displayName, verified: true });
            }

            done(null, user);

        } catch (error) {
            done(error);
        }
    }))
}

// install local strategy for signin via email-password

function installLocalStrategy(passport) {
    passport.use(new LocalStrategy( {
        usernameField: 'email',
    }, async (email, password, done) => {
        try {
            // find user by email
            const user = await getUserByEmail(email);
            if (null === user) {
                done(null,false, { message: 'incorrect email' });
                return;
            }

            // verify password
            const passwordMatched = await verifyPassword(password, user.password);
            if (!passwordMatched) {
                done(null,false,{ message: 'incorrect password'});
                return;
            }

            done(null, user);
        }
        catch(err) {
            done(err);
        }
    }))
}

// public key to verify the token
const JWT_PUBILIC_KEY = readFileSync(path.resolve(__dirname, '../..', process.env.JWT_PUBLIC_KEY));

// private key to sign the token
const JWT_PRIVATE_KEY = readFileSync(path.resolve(__dirname, '../..', process.env.JWT_PRIVATE_KEY));

// jwt asymmetric algorithm
const JWT_ALGORITHM = process.env.JWT_ALGORITHM;

/**
 * 
 * @param {object} payload 
 * @param {number | string} expiry token expiry as string
 *                                 '10s': 10 seconds
 *                                 '1m': one minute
 *                                 '1h': one hour
 *                                 '4d': four days
 *                                 '2y': two years
 * @returns {string} generated jwt
 */
function createToken(user, expiry = null) {
    const { id } = user;
    const payload = { id };

    // prepare options
    const options = { algorithm: JWT_ALGORITHM };
    if (typeof expiry === 'string') {
        options.expiresIn = expiry
    }
    
    // generate token and return
    const token = jwt.sign( payload, JWT_PRIVATE_KEY, options)
    return token
}

// install jwt strate for extracting token from request

function installJwtStrategy(passport) {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(), // access tokens are send as bearer in Authorization header
                ExtractJwt.fromBodyField('_refreshToken'), // refresh token is send in post request body
            ]),
        secretOrKey: JWT_PRIVATE_KEY,
        ignoreExpiration: false,
    }, (payload, done) => {
        const { id } = payload;
        const user = { id };
        done(null,user);
    }));
}

function installPassportStrategies(passport) {
    installLocalStrategy(passport);
    installGoogleOauthStrategy(passport);
    installJwtStrategy(passport);

    passport.serializeUser((user, done) => done(null,user));

    passport.deserializeUser((payload,done) => done(null,payload));
}

module.exports = {
    installPassportStrategies, createToken, 
}