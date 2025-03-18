const express = require('express');
const { Router } = express;
const { catchErrorAsync } = require('../utils/errors');
const { loginUser, authenticateEmailPassword, authenticateToken, 
        authenticateGoogleLogin, issueNewAccessToken, 
        sendPasswordResetLinkEmail,
        resetPassword, updatePassword , registerUser, verifyEmail, updateEmail, 
        sendVerificationEmail, logout } = require('../controllers/UserController');
const { registerUserRule, loginUserRule, verifyEmailRule, updateEmailRule,
        updatePasswordRule, 
        passwordResetLinkRule,
        passwordResetRule} = require('../middlewares/UserValidationRules');
const { validate } = require('../middlewares/Validation');

const routes = Router();
routes.use(express.json());

routes.post('/login',
    catchErrorAsync(validate(loginUserRule.schema,loginUserRule.fields)),
    authenticateEmailPassword,
    catchErrorAsync(loginUser)
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
    catchErrorAsync(loginUser),
);

routes.post('/register', 
    catchErrorAsync(validate(registerUserRule.schema,registerUserRule.fields)),
    catchErrorAsync(registerUser)
);

routes.get('/verify/email',
    catchErrorAsync(validate(verifyEmailRule.schema,verifyEmailRule.fields)),
    catchErrorAsync(verifyEmail)
);

routes.post('/password/reset/link', 
    catchErrorAsync(validate(passwordResetLinkRule.schema, passwordResetLinkRule.fields)),
    catchErrorAsync(sendPasswordResetLinkEmail)
);

const protectedRoutes = Router();

protectedRoutes.use(authenticateToken);

protectedRoutes.get('/dashboard', (req, res) => {
    res.send(`hello user ${req.user.id}`);
});

// regenerate a new access token. refersh token must be sent in body with _refreshToken
protectedRoutes.post('/refresh', 
    catchErrorAsync(issueNewAccessToken)
);

// send a new verification email
protectedRoutes.get('/verify/email/link', 
    catchErrorAsync(sendVerificationEmail)
);

// change email
protectedRoutes.patch('/email/new', 
    catchErrorAsync(validate(updateEmailRule.schema,updateEmailRule.fields)),
    catchErrorAsync(updateEmail)
);

// change password, requires existing password and new password
protectedRoutes.patch('/password/new',
    catchErrorAsync(validate(updatePasswordRule.schema, updatePasswordRule.fields)),
    catchErrorAsync(updatePassword)
);

// reset password, requires new password and confirmation password
protectedRoutes.patch('/password/reset', 
    catchErrorAsync(validate(passwordResetRule.schema,passwordResetRule.fields)),
    catchErrorAsync(resetPassword)
);

protectedRoutes.get('/logout', 
    catchErrorAsync(logout)
);

routes.use(protectedRoutes);

module.exports = {
    userRoutes: routes
}