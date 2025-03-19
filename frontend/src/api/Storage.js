export default class LocalStorage {

    put(key, value) {
        const strValue = this.convertTo(value, 'string');
        localStorage.setItem(key, strValue);
    }

    remove(key) {
        localStorage.removeItem(key);
    }

    has(key) {
        return null !== this.get(key);
    }

    get(key) {
        return localStorage.getItem(key);
    }

    getAsNumber(key, _default = null) {
        const strValue = this.get(key);
        if (null === strValue) {
            return _default;
        }
        const value = this.convertTo(strValue, 'number');
        return value;
    }

    getAsBoolean(key, _default = null) {
        const strValue = this.get(key);
        if (null === strValue) {
            return _default;
        }
        const value = this.convertTo(strValue, 'boolean');
        return value;
    }

    getAsObject(key, _default = null) {
        const strValue = this.get(key);
        if (null === strValue) {
            return _default;
        }
        const value = this.convertTo(strValue, 'object');
        return value;
    }

    getAsArray(key, _default = null) {
        const strValue = this.get(key);
        if (null === strValue) {
            return _default;
        }
        const value = this.convertTo(strValue, 'array');
        return value;
    }

    convertTo(value, type) {
        const valueType = typeof value;
        if (type === 'string') {
            switch(valueType) {
                case 'number': {
                    return `${value}`;
                }
                case 'boolean': {
                    return value ? 'true' : 'false';
                }
                case 'object': {
                    return JSON.stringify(value);
                }
                default: {
                    return value;
                }
            }
        }
        else {
            switch(type) {
                case 'number': {
                    return Number(value);
                }
                case 'boolean': {
                    return value === 'true';
                }
                case 'object':
                case 'array': {
                    return JSON.parse(value);
                }
                default: {
                    return value;
                }
            }
        }
    }
}

const KEY_ACCESS_TOKEN_TOKE = 'access-token:token';
const KEY_ACCESS_TOKEN_EXPIRE = 'access-token:expire';
const KEY_REFRESH_TOKEN_TOKE = 'refresh-token:token';
const KEY_REFRESH_TOKEN_EXPIRE = 'refresh-token:expire';

function isAfter(what) {
    const gmtNow = Math.floor(Date.now()/1000);
    return what > gmtNow;
}

class AppStorage {

    constructor() {
        this.storage = new LocalStorage();
    }

    putAccessToken(token, expire) {
        this.storage.put(KEY_ACCESS_TOKEN_TOKE,token);
        this.storage.put(KEY_ACCESS_TOKEN_EXPIRE,expire);
    }

    getAccessToken() {
        const token = this.storage.get(KEY_ACCESS_TOKEN_TOKE);
        return token;
    }

    isAccessTokenExpired() {
        const expire = this.storage.getAsNumber(KEY_ACCESS_TOKEN_EXPIRE);
        return !isAfter(expire);
    }

    removeAccessToken() {
        this.storage.remove(KEY_ACCESS_TOKEN_TOKE);
        this.storage.remove(KEY_ACCESS_TOKEN_EXPIRE);
    }

    putRefreshToken(token, expire) {
        this.storage.put(KEY_REFRESH_TOKEN_TOKE, token);
        this.storage.put(KEY_REFRESH_TOKEN_EXPIRE, expire);
    }

    getRefreshToken() {
        const token = this.storage.get(KEY_REFRESH_TOKEN_TOKE);
        return token;
    }

    isRefreshTokenExpired() {
        const expire = this.storage.getAsNumber(KEY_REFRESH_TOKEN_EXPIRE);
        return !isAfter(expire);
    }

    removeRefreshToken() {
        this.storage.remove(KEY_REFRESH_TOKEN_TOKE);
        this.storage.remove(KEY_REFRESH_TOKEN_EXPIRE);
    }

    putLoggedinUser(user) {
        this.storage.put('user:loggedin', user);
    }

    getLoggedinUser() {
        const user = this.storage.getAsObject('user:loggedin');
        return user;
    }

    updateLoggedinUser(newData) {
        const user = this.getLoggedinUser();
        if (user && newData) {
            const updatedUser = { ...user, ...newData };
            this.putLoggedinUser(updatedUser);
        }
    }

    removeLoggedinUser() {
        this.storage.remove('user:loggedin');
    }

    isLoggedin() {
        return this.storage.has('user:loggedin');
    }
}

export const appStorage = new AppStorage();
