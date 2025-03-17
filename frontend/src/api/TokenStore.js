export default class TokenStore {

    getAccessToken() { return null; }

    isAccessTokenExpired() { return false; }

    updateAccessToken(token, expire) {}

    getRefreshToken() { return false; }

    updateRefreshToken(token, expire) {}

    isRefreshTokenExpired() { return false; }
}

