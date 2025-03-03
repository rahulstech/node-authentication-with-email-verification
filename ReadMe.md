# NodeJS Authentication with Email Verification and OAuth

This project provides a robust and secure authentication system for your Node.js applications, featuring email verification, password management, and OAuth integration (Google). It emphasizes security best practices, including token-based authentication with *asymmetric key signing* and password hashing.

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Installation](#installation)
    - [Development](#developmen-installation)
    - [Production](#production-installation)
* [API Endpoints](#api-endpoints)


## Features <a name="features"></a>

* **User Registration:**
    * Email and Password registration with mandatory email verification.
    * Google OAuth registration.
* **Email Verification:**
    * Time-limited verification links (15 minutes).
    * Resend verification email functionality.
    * Change email address with verification.
* **Password Management:**
    * Secure password hashing using bcrypt.
    * Password reset functionality with time-limited reset links (5 minutes).
    * Change password functionality.
* **Authentication:**
    * Token-based authentication (JWT).
    * Short-lived access tokens (15 minutes).
    * Long-lived refresh tokens (7 days) for seamless token renewal.
    * Access tokens are sent via the `Authorization` header (Bearer token).
* **Security:**
    * Protection against common vulnerabilities.
* **Scalability:**
    * Designed for scalability using Redis for caching.

[Go to Table of Contents](#table-of-contents)

## Tech Stack <a name="tech-stack"></a>

* **Backend:**
    * Node.js
    * Express.js
    * Passport.js (for authentication strategies)
* **Database:**
    * MySQL (with Sequelize ORM)
* **Caching:**
    * Redis
* **Email:**
    * AWS SES
* **Authentication & Authorization:**
    * JWT (JSON Web Tokens)
    * Google OAuth 2.0
* **Validation:**
    * Joi
* **Other:**
    * Bcrypt (for password hashing)

[Go to Table of Contents](#table-of-contents)

## Installation <a name="installation"></a>

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/rahulstech/node-authentication-with-email-verification.git

    cd node-authentication-with-email-verification
    ````

2. **Environment Variables:**

    * Copy `example.env-dev` to `.env-dev` and `example.env-prod` to `.env-prod`
    * Fill in the required credentials:
        * Google OAuth Client ID and Secret
        * AWS SES credentials (IAM user with SES permissions)
        * Redis host and port (defaults are usually fine)

            ```
            # Example .env file
            GOOGLE_CLIENT_ID=your_google_client_id
            GOOGLE_CLIENT_SECRET=your_google_client_secret
            AMAZON_ID=your_aws_iam_id
            AMAZON_SECRET=your_aws_iam_secret
            AMAZON_REGION=your_aws_region
            EMAIL_VERIFICATION_SENDER=your_verified_ses_email
            REDIS_HOST=localhost
            REDIS_PORT=6379
            ```

3.  **JWT Keys:**

    * Generate RSA key pair for JWT signing (using OpenSSL):

        ```bash
        openssl genpkey -algorithm RSA -out jwt_private.pem -pgenopt rsa:key_gen_bits:4096
        openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
        ```

    * Place `jwt_private.pem` and `jwt_public.pem` in the `secrets` directory.  *(Create the `secrets` directory if it doesn't exist.)*


    **Development** <a name="development-installation"></a>
    
    4.  **Install Dependencies:**

        ```bash
        npm install
        ```

    5.  **Database Setup:**

        * Configure MySQL connection in `config/config.json`.
        * Create the database and run migrations:

            ```bash
            npx sequelize-cli db:create
            npx sequelize-cli db:migrate
            ```


    6.  **Run the Dev Server:**

        ```bash
        npm run dev
        ```

        The server will typically start on port 5000 (configurable in `.env-dev`).

    [Go to Table of Contents](#table-of-contents)

    **Production:** <a name="production-installation"></a>

    4. **Run Docker:**
        
        * Run the following command from the project root directory

            ```sh
            docker-compose up -d # -d will run containers in detached mode. remove -d if you don't want to run in detached mode
            ```


    [Go to Table of Contents](#table-of-contents)

## API Endpoints <a name="api-endpoints"></a>

```
POST /register - Register a new user
POST /login - Login a user with email and password
GET /login/google - Login via google
GEt /google/callback - Web hook used by google oauth server on authenticated
GET /dashboard - 
POST /refresh - Generates new access token based on sent refresh token in request body
GET /verify/email/link - Send a new email verification link to registered email, requires login
GET /verify/email - Verify email
PATCH /email/new - Change email, requires login
POST /password/reset/link - Generate the password reset link
PATCH /password/reset - Reset password if forget
PATCH /password/new - Change password, requires log in
GET /logout - Log out, requires login
```

[Go to Table of Contents](#table-of-contents)
