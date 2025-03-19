import { useCallback, useContext, useMemo, useState } from "react";
import { createContext } from "react";
import AuthApi from '../api/AuthApi';
import UserApi from '../api/UserApi';
import { appStorage } from "../api/Storage";
import { useRef } from "react";

export const AppContext = createContext();

export function useAppContext() {
    return useContext(AppContext);
}

export const LoadingStatus = {
    INIT: 'INIT',
    RUNNING: 'RUNNING',
    SUCCESSFUL: 'SUCCESSFUL',
    FAILED: 'FAILED',
};

export function AppContextProvider({ children }) {

    const refAuthApi = useRef(new AuthApi(appStorage));
    const refUserApi = useRef(new UserApi(appStorage));

    const [userState, setUserState] = useState({
        user: appStorage.getLoggedinUser(), 
        loading: false, 
        errors: null,
    });

    const [loadingState, setLoadingState] = useState({});

    const updateUserState = (loading, errors = null, user = undefined) => {
        setUserState(prevState => {
            const newState = { ...prevState, loading, errors };
            if (user !== undefined) {
                newState.user = user;
            }
            return newState;
        });
    };

    const updateLoadingState = (status, errors = null) => {
        setLoadingState(prevState => {
            const newState = { errors };
            newState.completed = status === LoadingStatus.FAILED || status === LoadingStatus.SUCCESSFUL;
            newState.failed = status === LoadingStatus.FAILED;
            return newState;
        })
    }

    function login({ email, password }) {
        updateUserState(true);
        refAuthApi.current.login(email, password)
        .then(({ success, data, errors }) => {
            const user = success ? data.user : null;
            updateUserState(false, errors, user);
        })
        .catch(error => {
            updateUserState(false, {}, null);
        })
    }

    function signup({ email, password, displayName }) {
        updateUserState(true);
        refAuthApi.current.register(email, password, displayName)
        .then(({ success, data, errors }) => {
            const user = success ? data.user : null;
            updateUserState(false, errors, user);
        })
        .catch(error => {
            updateUserState(false,{},null);
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

    function verifyEmail(token) {
        updateUserState(true);
        refUserApi.current.verifyEmail(token)
        .then(({ status, errors }) => {
            updateUserState(false,errors);
        })
        .catch(error => {
            console.log('verifyEmail error ', error);
            updateUserState(false, { description: 'some error occurred' });
        })
    }

    function changeEmail(email, password) {}

    function changePassword(newPassword, currentPassword) {
        updateUserState(true);
        refUserApi.current.changePassword(newPassword, currentPassword)
        .then(({ errors, }) => {
            updateUserState(false, errors);
        })
        .catch(error => {
            updateUserState(false, { description: '' });
        })
    }

    function sendPasswordResetLink(email) {
        updateLoadingState(LoadingStatus.INIT)
        refUserApi.current.requestPasswordResetLink(email)
        .then(({success,errors}) => {
            updateLoadingState(success ? LoadingStatus.SUCCESSFUL : LoadingStatus.FAILED, errors);
        })
        .catch(error => {
            updateLoadingState(LoadingStatus.FAILED, {});
        })
    }

    function resetPassword(token, newPassword) {
        refUserApi.current.resetPassword(token,newPassword)
        .then(({success}) => {

        })
        .catch(error => {

        })
    }


    const contextValue = useMemo(() => ({
        userState, loadingState, 
        signup, login, logout , verifyEmail, changeEmail, changePassword, sendPasswordResetLink, resetPassword,
    }), [userState,loadingState])

    return (
        <AppContext.Provider value={contextValue} >
            {children}
        </AppContext.Provider>
    )
}