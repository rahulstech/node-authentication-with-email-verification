const express = require('express');
const { Router } = express;
const { catchErrorAsync } = require('../utils/errors');
const { postLogin, authenticateEmailPassword, authenticateToken, authenticateGoogleLogin, issueNewAccessToken } = require('../middlewares/Auth');
const { registerUser, verifyEmail, sendNewVerificationEmail, logout } = require('../controllers/UserController');
const { registerUserRule, loginUserRule, verifyEmailRule } = require('../middlewares/UserValidationRules');
const { validate } = require('../middlewares/Validation');

const routes = Router();
routes.use(express.json());

routes.post('/login',
    catchErrorAsync(validate(loginUserRule.schema,loginUserRule.fields)),
    authenticateEmailPassword,
    catchErrorAsync(postLogin)
);

// this end point is responsible for opening the google authentication page in browser
// in font end i can add a link to this end point and browser will be redirected to 
// google authentication page.
routes.get('/login/google', authenticateGoogleLogin)


// when authentication is complete in google i.e. oauth provider end
// it will redirect to this endpoint. Note that
// - this end point will be called by the oauth service weather the authentication is successful or fail
//   i have to check authentication status and do what ever is required for each case of success and failure
// - this end point must match the callbackUrl value in GoogleStategy during passport google stategy setup
// - this end point should be added to OAuth Client Redirect Url value in google console
routes.get('/google/callback', 
    authenticateGoogleLogin, 
    catchErrorAsync(postLogin),
);

routes.post('/register', 
    catchErrorAsync(validate(registerUserRule.schema,registerUserRule.fields)),
    catchErrorAsync(registerUser)
);

routes.get('/verify/email',
    catchErrorAsync(validate(verifyEmailRule.schema,verifyEmailRule.fields)),
    catchErrorAsync(verifyEmail)
);

routes.get('/logout',
    catchErrorAsync(logout)
);

const protectedRoutes = Router();

protectedRoutes.use(authenticateToken);

protectedRoutes.get('/dashboard', (req, res) => {
    res.send(`hello user ${req.user.id}`);
});

protectedRoutes.post('/refresh', 
    catchErrorAsync(issueNewAccessToken)
);

protectedRoutes.get('/verify/email/new', 
    catchErrorAsync(sendNewVerificationEmail)
);

routes.use(protectedRoutes);

module.exports = {
    userRoutes: routes
}