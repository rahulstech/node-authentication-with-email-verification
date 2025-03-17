import { useContext, useState } from "react";
import { createContext } from "react";
import AuthApi from '../api/AuthApi';
import UserApi from '../api/UserApi';
import { appStorage } from "../api/Storage";
import { useRef } from "react";
import TokenStore from "../api/TokenStore";

export const AppContext = createContext();

export function useAppContext() {
    return useContext(AppContext);
}

class TokenStoreImpl extends TokenStore {

    getAccessToken() {
        return appStorage.getAccessToken();
    }

    isAccessTokenExpired() {
        return appStorage.isAccessTokenExpired();
    }

    getRefreshToken() {
        return appStorage.getRefreshToken();
    }
}

export function AppContextProvider({ children }) {

    const refAuthApi = useRef(new AuthApi(new TokenStoreImpl()));
    const refUserApi = useRef(new UserApi(new TokenStoreImpl()));

    const [userState, setUserState] = useState({
        user: appStorage.getLoggedinUser(), 
        loading: false, 
        errors: null 
    });

    function login({ email, password }) {
        setUserState(prevState => {
            const newUserState = { ...prevState, loading: true };
            return newUserState;
        });
        refAuthApi.current.login(email, password)
        .then(({ success, status, data, errors, errorReason }) => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                if (success) {
                    const user = data.user;
                    appStorage.putLoggedinUser(user);
                    newUserState.user = user; 
                    newUserState.errors = null;
                }
                else if (status === 400 || status === 401) {
                    newUserState.errors = errors;
                    newUserState.user = null;
                }
                else {
                    newUserState.errors = { description: errorReason }
                    newUserState.user = null;
                }
                return newUserState;
            });
        })
        .catch(error => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                return newUserState;
            });
        })
    }

    function signup([ email, password, displayName ]) {
        setUserState(prevState => {
            const newUserState = { ...prevState, loading: true };
            return newUserState;
        });
        refAuthApi.current.register(email, password, displayName)
        .then(({ success, status, data, errors, errorReason }) => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                if (success) {
                    newUserState.user = data.user;
                }
                else if (status >= 500) {
                    newUserState.errors = { description: errorReason }
                    newUserState.user = null;
                }
                return newUserState;
            })
            
        })
        .catch(err => {

        })
    }

    function logout() {

        refUserApi.current.logout()
        .then( ({ success }) => {
            if (success) {
                // remove the user from userState
                setUserState(prevState => ({
                    ...prevState,
                    user: null,
                }));

                // remove logged in user from app storage
                appStorage.removeLoggedinUser();

                // remove tokens from app storage
                appStorage.removeAccessToken();
                appStorage.removeRefreshToken();
            }
        })
        .catch( error => {
            console.log('logout ', error);
        })
    }

    return (
        <AppContext.Provider value={{ userState, signup, login, logout }} >
            {children}
        </AppContext.Provider>
    )
}