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

    updateAccessToken(token,expire) {
        appStorage.putAccessToken(token,expire);
    }

    updateRefreshToken(token,expire){
        appStorage.putRefreshToken(token,expire);
    }
}

export function AppContextProvider({ children }) {

    const refAuthApi = useRef(new AuthApi(new TokenStoreImpl()));
    const refUserApi = useRef(new UserApi(new TokenStoreImpl()));

    const [userState, setUserState] = useState({
        user: appStorage.getLoggedinUser(), 
        loading: false, 
        errors: null,
    });

    const [userEmailState, setUserEmailState] = userState({
        emailVerified: false,
        loading: false,
        errors: null,
    })

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
            console.log('login error ', error);
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                return newUserState;
            });
        })
    }

    function signup({ email, password, displayName }) {
        setUserState(prevState => {
            const newUserState = { ...prevState, loading: true };
            return newUserState;
        });
        refAuthApi.current.register(email, password, displayName)
        .then(({ success, status, data, errors, errorReason }) => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                if (success) {
                    const user = data.user;
                    appStorage.putLoggedinUser(user);
                    newUserState.user = user; 
                    newUserState.errors = null;
                }
                else if (status >= 500) {
                    newUserState.errors = { description: errorReason }
                    newUserState.user = null;
                }
                else if (status >= 400) {
                    newUserState.errors = errors;
                    newUserState.user = null;
                }
                return newUserState;
            })
        })
        .catch(error => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                return newUserState;
            });
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
        setUserState(prevState => {
            const newState = { 
                ...prevState,
                verification: {
                    ...prevState.verification,
                    email: {
                        loading: true,
                    }
                }
            }
            return newState;
        });

        


        // refUserApi.current.verifyEmail(token)
        // .then(({ status, errors, errorReason }) => {
        //     setUserState(prevState => {
        //         const newState = {
        //             ...prevState,
        //             verification: {
        //                 ...prevState.verification,
        //                 email: {
        //                     loading: false,
        //                 }
        //             },
        //         };
        //         if (status >= 500) {
        //             newState.verification.email.errors = { description: errorReason }
        //         }
        //         else if (status >= 400) {
        //             newState.verification.email.errors = errors;
        //         }
        //         return newState;
        //     })
        // })
        // .catch(error => {
        //     console.log('verifyEmail error ', error);
        //     setUserState(prevState => {
        //         const newState = { 
        //             ...prevState,
        //             verification: {
        //                 ...prevState.verification,
        //                 email: {
        //                     loading: false,
        //                 }
        //             }
        //         }
        //         return newState;
        //     })
        // })
    }

    function resetEmail() {}

    return (
        <AppContext.Provider value={{ 
            userContext: { ...userState, signup, login, logout },
            userEmailContext: { userEmail: userEmailState, verifyEmail, resetEmail }
         }} >
            {children}
        </AppContext.Provider>
    )
}