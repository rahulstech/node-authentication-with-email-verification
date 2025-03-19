import axios from 'axios';
import { catchAxiosError, createResult } from './ApiUtil';


export default class AuthApi {

    constructor(storage) {
        this.storage = storage;
    }

    getClient() {
        const client = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            timeout: import.meta.env.VITE_API_TIMEOUT,
        });
        return client;
    }

    __updateTokens(tokens) {
        const accessToken = tokens['access-token'];
        const refreshToken = tokens['refresh-token'];
        this.storage.putAccessToken(accessToken.token, accessToken.expire);
        this.storage.putRefreshToken(refreshToken.token,refreshToken.expire);
    }

    login(email, password) {
        return catchAxiosError(async () => {
            const res = await this.getClient().post('/login', { email, password });
            this.__updateTokens(res.data.tokens);
            this.storage.putLoggedinUser(res.data.user);
            return createResult(res);
        });
    }

    register(email, password, displayName) {
        return catchAxiosError(async () => {
            const res = await this.getClient().post('/register', { email, password, displayName });
            this.__updateTokens(res.data.tokens);
            this.storage.putLoggedinUser(res.data.user);
            return createResult(res);
        });
    }
}