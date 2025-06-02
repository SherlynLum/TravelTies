import { createContext, useEffect, useState, useContext } from "react";
import { Alert } from "react-native";
import { createUserWithEmailAndPassword, getIdToken, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebaseConfig";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

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
            return {success: true, data: response?.user}
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

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID
    })

    const googleSignIn = () => {
        if (!request) {
            Alert.alert('Google sign in not ready', 'Please try again in a moment');
            return Promise.resolve;
        }
        promptAsync();
    }

    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;

            if ( !id_token ) {
                console.log("No id_token in response");
                return;
            }

            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).then(({ user }) => {
                setUser(user);
                setIsAuthenticated(true);
            }).catch((e) => {
                console.log("Firebase Google sign-in error: ", e.message);
            });
        }
    }, [response]);

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
        <AuthContext.Provider value = {{ user, isAuthenticated, login, logout, register, googleSignIn}}>
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