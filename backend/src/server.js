/**
 * General Idea About Authentication And Authorization via OAuth
 * =============================================================
 * Authentication and authorization are two different purpose and OAuth is mainly of authorization purpose.
 * 
 * For example: my service wants to use the google drive service of the user. then i need authorization and
 * OAuth mainly solve this problem. i obtain an access token. that describes what the token owner allowed to do
 * and restricted to do. for example: my service is allowed to make changes and read a perticular directory.
 * but my service can not read or write any other directories. that is authorization. my service wants
 * authorization of user's google drive but google drive is not owned by my service, it is owned by google. therefore
 * my service obtains a oauth token from google to perform some tasks on behalf of the user. in authorization primary 
 * focus is not creating a user profile but perfoming the task till token's auhtorization is not expired
 * 
 * On the other hand authentication is identifing oneself that i am allowed to use the service. but not exactly what i am
 * allowed to use in this service, because that is handled by authorization. in oauth authorization the service simply 
 * obtains the user basic info like email, display name, display image etc. and creates a new profile in this service.
 * once the profile is created, the service has nothing to do with the oauth provider. even the user basic info changes in
 * oauth provider it does not effect in this service. also if the user diconnects this service from oauth connected app list,
 * it does not deletes the user from this service.
 */

/**
 * 1. Create a project in google cloud console
 * 2. in OAuth Consent Screen add details like 
 *    - scopes (profile, email and openid for this app)
 *    - add test users, becuase currentlyc the app publishing status is testing
 * 3. create a new oauth client id adding
 *    - client type: web client
 *    - client name: nodejs-oauth-passport
 *    - authorize redirect url: http://localhost:5000/google/callback.
 *                              this url must match the value i pass in passport google stategy callbackUrl option
 *                              otherwise it will authentication will fail
 * 4. save the oauth client and save the client id and client secrect in .env file
 */

const express = require('express')
const { userRoutes } = require('./routes/UserRoutes')
const passport = require('passport');
const { installPassportStrategies } = require('./services/AuthenticationService')
const { ApiError, AppError } = require('./utils/errors')
const { logger } = require('./utils/logger');

const server = express();

// currently don't enforce cors policy and allow all requests form any origin
server.use(require('cors')());

// initialize passport

server.use(passport.initialize());

installPassportStrategies(passport);

// Routes 

server.use(userRoutes);

// Routes Error Handler

server.use((error,req,res,next) => {
    logger.error('Server',  error, { "http-method": req.method, "http-path": req.url });

    if (error instanceof ApiError) {
        const reason = error.reason;
        res.status(error.statusCode).json(reason);
    }
    else {
        res.sendStatus(500);
        if (error instanceof AppError) {
            if (!error.isOperational) {
                process.exit(1);
            }
        }
    }
})

module.exports = { server }
