# NodeJS Authentication with Email Verification and OAuth

This project provides a robust and secure authentication system for your Node.js applications, featuring email verification, password management, and OAuth integration (Google). It emphasizes security best practices, including token-based authentication with *asymmetric key signing* and password hashing.

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Installation](#installation)
* [API Endpoints](#api-endpoints)
* [Contributing](#contributing)
* [License](#license)


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
    * Protection against common vulnerabilities. (Mention specific protections if implemented, e.g., rate limiting, input validation)
* **Scalability:**
    * Designed for scalability using Redis for caching. (Explain what you're caching)

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

2.  **Environment Variables:**

      * Copy `.env-copy` to `.env`.
      * Fill in the required credentials:
          * Google OAuth Client ID and Secret
          * AWS SES credentials (IAM user with SES permissions)
          * Redis host and port (defaults are usually fine)

    <!-- end list -->

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

    <!-- end list -->

    ```bash
    openssl genpkey -algorithm RSA -out jwt_private.pem -pgenopt rsa:key_gen_bits:4096
    openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
    ```

    * Place `jwt_private.pem` and `jwt_public.pem` in the `secrets` directory.  *(Create the `secrets` directory if it doesn't exist.)*

4.  **Database Setup:**

      * Configure MySQL connection in `config/config.json`.
      * Create the database and run migrations:

    <!-- end list -->

    ```bash
    npx sequelize-cli db:create
    npx sequelize-cli db:migrate
    ```

5.  **Install Dependencies:**

<!-- end list -->

```bash
npm install
```

6.  **Run the Server:**

<!-- end list -->

```bash
npm run dev  # (or npm start if you have that script defined)
```


* The server will typically start on port 5000 (configurable in `.env`).


[Go to Table of Contents](https://www.google.com/url?sa=E&source=gmail&q=#table-of-contents)

## API Endpoints <a name="api-endpoints"></a>

*(Provide a few key API endpoint examples with request methods, URLs, request bodies (if needed), and response examples.  This is crucial for developers wanting to use your API.)*

```
POST /auth/register - Register a new user
POST /auth/login - Login a user
GET /auth/verify/:token - Verify email
POST /auth/resend-verification - Resend verification email
# ... (add more endpoints)
```

[Go to Table of Contents](https://www.google.com/url?sa=E&source=gmail&q=#table-of-contents)
