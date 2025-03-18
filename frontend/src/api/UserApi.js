import axios from "axios";
import { catchAxiosError, createResult } from './ApiUtil';

export default class UserApi {

    constructor(tokenStore) {
        this.tokenStore = tokenStore;
    }

    getClient(options = null) {
        const client = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            timeout: import.meta.env.VITE_API_TIMEOUT,
        });

        // set Authorization header if access token exists
        const accessToken = this.tokenStore.getAccessToken();
        if (accessToken && !this.tokenStore.isAccessTokenExpired()) {
            client.defaults.headers.common['Authorization'] = `bearer ${accessToken}`;
            client.defaults.withCredentials = true;
        }

        return client;
    }

    verifyEmail(token) {
        return catchAxiosError(async () => {
            const client = this.getClient();
            const res = await client.get('/verify/email', {
                params: {
                    token
                }
            });
            return createResult(res);
        })();
    }

    changeEmail() {}

    changePassword() {}

    resetPassword() {}

    issueNewAccessToken() {
        return catchAxiosError(async () => {
            const _refreshToken = this.tokenStore.getRefreshToken();
            const res = await this.getClient().post('/refresh', { _refreshToken });
            const { token, expire } = res.data["access-token"];
            this.tokenStore.updateAccessToken(token,expire);  
            return { success: true };
        })();
    }

    logout() {
        return catchAxiosError(async () => {
            const res = await this.getClient().get('/logout');
            return createResult(res);
        })()
    }
}