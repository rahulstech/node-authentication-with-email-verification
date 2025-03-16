import { useContext, useState } from "react";
import { createContext } from "react";
import { handleLogin } from '../api/Auth';

export const AppContext = createContext({});

export function useAppContext() {
    return useContext(AppContext);
}

export function AppContextProvider({ children }) {

    const [userState, setUserState] = useState({ user: null, loading: false, errors: null });

    function login(data) {
        setUserState(prevState => {
            const newUserState = { ...prevState, loading: true };
            return newUserState;
        });
        handleLogin(data)
        .then(({ status, data }) => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                if (status === 200) {

                    console.log('data ', data)

                    const accessToken = data.tokens["access-token"];
                    const refreshToken = data.tokens["refresh-token"];

                    localStorage.setItem("access-token", accessToken.token);
                    localStorage.setItem("access-token:expire", `${accessToken.expire}`);
                    localStorage.setItem("refresh-token", refreshToken.token);
                    localStorage.setItem("refresh-token:expire", `${refreshToken.expire}`);
                    
                    newUserState.user = data.user; 
                    newUserState.errors = null;
                }
                else if (status === 400 || status === 401) {
                    const errors = {};
                    data.details.forEach(e => {
                        errors[e.key] = e.explain;
                    });
                    newUserState.errors = errors;
                    newUserState.user = null;
                }
                else {
                    newUserState.errors = { description: data.description }
                    newUserState.user = null;
                }
                return newUserState;
            });
        })
        .catch(error => {
            console.log('api error ', error);
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                return newUserState;
            });
        })
    }

    function signup(data) {
        const args = { type: 'singup', ...data };
        setUserState(prevState => {
            const newUserState = { ...prevState, loading: true };
            return newUserState;
        });
        setTimeout(() => {
            setUserState(prevState => {
                const newUserState = { ...prevState, loading: false };
                return newUserState;
            });
        }, 1500);
    }

    function logout() {
        
    }

    return (
        <AppContext.Provider value={{ userState, signup, login, logout }} >
            {children}
        </AppContext.Provider>
    )
}