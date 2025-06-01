import { createContext, useEffect, useState, useContext } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig"

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user)
            } else {
                setIsAuthenticated(false);
                setUser(null)
            }
        })
        return unsub;
    }, [])

    const login = async (email, password) => {
        try {

        } catch (e) {

        }
    }

    const logout = async () => {
        try {

        } catch (e) {

        }
    }

    const register = async (email, password, username, profilePicUrl) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log('response.user :', response?.user);
        } catch(e) {
            
        }
    }

    return (
        <AuthContext.Provider value = {{ user, isAuthenticated, login, logout, register}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error("useAuth must be wrapped inside AuthContextProvider")
    }
    return value;
}