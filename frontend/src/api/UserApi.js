import axios from "axios";
import { catchAxiosError } from './ApiUtil';

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

    changeEmail() {}

    changePassword() {}

    resetPassword() {}

    issueNewAccessToken() {
        return catchAxiosError(async () => {
            const _refreshToken = this.tokenStore.getRefreshToken();
            const res = await this.getClient().post('/refresh', { _refreshToken });
            const { token, expire } = res.data.accessToken;
            this.tokenStore.updateAccessToken(token,expire);  
            return { success: true };
        })();
    }

    logout() {
        return catchAxiosError(async () => {
            const res = await this.getClient().get('/logout');
            return { success: true };
        })()
    }
}