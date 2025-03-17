import axios from 'axios';
import { catchAxiosError, createResult } from './ApiUtil';

export default class AuthApi {

    constructor(tokenStore) {
        this.tokenStore = tokenStore;
    }

    getClient() {
        const client = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            timeout: import.meta.env.VITE_API_TIMEOUT,
        });
        return client;
    }

    login(email, password) {
        return catchAxiosError(async () => {
            const res = await this.getClient().post('/login', { email, password });
            const { accessToken, refreshToken } = res.data;
            this.tokenStore.updateAccessToken(accessToken.token, accessToken.expire);
            this.tokenStore.updateRefreshToken(refreshToken.token,refreshToken.expire);
            return createResult(res);
        })();
    }

    register(email, password, displayName) {
        return catchAxiosError(async () => {
            const res = await this.getClient().post('/register', { email, password, displayName });
            return createResult(res);
        })();
    }
}