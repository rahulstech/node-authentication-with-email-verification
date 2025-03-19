import axios from "axios";
import { catchAxiosError, createResult } from './ApiUtil';

export default class UserApi {

    constructor(storage) {
        this.storage = storage;
    }

    getClient(options = null) {
        const client = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            timeout: import.meta.env.VITE_API_TIMEOUT,
        });

        // set Authorization header if access token exists
        const accessToken = this.storage.getAccessToken();
        if (accessToken && !this.storage.isAccessTokenExpired()) {
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
            if (res.status === 200) {
                this.storage.updateLoggedinUser({ verified: true });
            }
            return createResult(res);
        });
    }

    changeEmail() {}

    async changePassword(newPassword, currentPassword) {
        await  this._refreshAccessTokenIfNeeded();

        return catchAxiosError(async () => {
            const client = this.getClient();
            const res = await client.patch('/password/new', {
                password: currentPassword,
                newPassword,
             });
             return createResult(res);
        });
    }

    async _refreshAccessTokenIfNeeded() {
        if (!this.storage.isAccessTokenExpired()) {
            return;
        }
        const { success, errors } = await catchAxiosError(async () => {
            const _refreshToken = this.storage.getRefreshToken();
            const res = await this.getClient().post('/refresh', { _refreshToken });
            const { token, expire } = res.data["access-token"];
            this.storage.putAccessToken(token,expire);  
            return createResult(res);
        });

        if (!success) {
            throw { errors: { description: "session expired" } };
        }
    }

    async logout() {
        await this._refreshAccessTokenIfNeeded();

        return await catchAxiosError(async () => {
            const res = await this.getClient().get('/logout');
            return createResult(res);
        });
    }

    requestPasswordResetLink(email) {
        return catchAxiosError(async ()=>{
            const client = this.getClient();
            const res = await client.post('/password/reset/link', { email });
            return createResult(res);
        })
    }

    resetPassword(token, newPassword) {
        return catchAxiosError(async () => {
            const client = this.getClient();
            const res = await client.patch('/password/reset', { password: newPassword }, {
                params: {
                    'Reset-Token': token,
                }
            });
            return createResult(res);
        });
    }
}