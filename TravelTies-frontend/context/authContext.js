import { createContext, useEffect, useState, useContext } from "react";
import { createUserWithEmailAndPassword, getIdToken, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
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
            const response = await signInWithEmailAndPassword(auth, email, password);
            return {success: true}
        } catch (e) {
            let message = e.message;
            if (message.includes('(auth/invalid-email)')) {
                message = 'Invalid email';
            }
            if (message.includes('(auth/invalid-credential)')) {
                message = 'Incorrect email or password';
            }
            return {success: false, message};
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            return {success: true};
        } catch (e) {
            return {success: false, message: e.message, error: e};
        }
    }

    const register = async (email, password, username, profilePicUrl) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = response?.user;
            if (!newUser) {
                throw new Error("Sign up failed")
            }
            console.log('response.user :', newUser);

            const token = await getIdToken(newUser);

            await fetch("http://localhost:3000/api/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({})
            })
            return {success: true, data: newUser};
        } catch(e) {
            let message = e.message;
            if (message.includes('(auth/invalid-email)')) {
                message = 'Invalid email';
            }
            if (message.includes('(auth/email-already-in-use)')) {
                message = 'This email is already registered';
            }
            return {success: false, message};
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