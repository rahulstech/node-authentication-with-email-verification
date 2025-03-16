import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

function createResult(axiosResponse) {
    return { status: axiosResponse.status, data: axiosResponse.data };
}

export function catchAxiosError(requetHandler) {
    return (...args) => {
        return new Promise(async (resolve,reject) => {
            try {
                const result = await requetHandler(...args);
                resolve(result);
            }
            catch(error) {
                if (error.name === 'AxiosError') {
                    const result = { status: error.status, data: error.response.data };
                    resolve(result);
                }
                else {
                    reject(error);
                }
            }
        });
    }
}

export const handleLogin = catchAxiosError(async (data) => {
    const { email, password } = data;
    const res = await api.post('/login', { email, password });
    return createResult(res);
});

export const handleSignup = catchAxiosError(async (data) => {
    const { email, password, displayName } = data;
    const res = await api.post('/register', { email, password, displayName });
    return { status: res.status, data: res.data };
});

export const handleLogout = catchAxiosError(async (user) => {

});