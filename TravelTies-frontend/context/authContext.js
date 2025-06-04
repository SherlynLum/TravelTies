import { createContext, useEffect, useState, useContext } from "react";
import { createUserWithEmailAndPassword, getIdToken, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin"

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    const [hasOnboarded, setHasOnboarded] = useState(undefined);

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

    const syncWithDatabase = async (user) => {
        const token = await getIdToken(user);
        const backendRes = await fetch("http://localhost:3000/api/user/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({})
        })
        const backendResJson = await backendRes.json();

        // return based on database result
        if (!backendRes.ok) {
            throw new Error("Failed to load data: " + backendResJson.message);
        } else if (!backendResJson?.data) {
            throw new Error("Failed to load data")
        } else if (backendResJson.onboard) {
            setHasOnboarded(true);
        } else if (!backendResJson.onboard) {
            setHasOnboarded(false);
        }
        return {success: true, data: backendResJson.data};
    }

    const login = async (email, password) => {
        try {
            // sign in with Firebase
            const response = await signInWithEmailAndPassword(auth, email, password);
            const user = response.user;

            // sync with database
            const result = await syncWithDatabase(user);
            return result;
        } catch (e) {
            let message = e.message || "Sign in failed";
            if (e.code === "auth/invalid-email") {
                message = "Invalid email";
            } else if (e.code === "auth/wrong-password") {
                message = "Wrong password";
            } else if (e.code === "auth/user-not-found") {
                const loginMethod = await fetchSignInMethodsForEmail(auth, email);
                if (!loginMethod.length) {
                    message = "No user exists with this email";
                } else if (loginMethod.includes("google.com")) {
                    message = "This email is registered with Google - please sign in with Google";
                }
            }
            return {success: false, message};
        }
    }

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        });
    }, [])

    const signInWithGoogle = async () => {
        try {
            // sign in in Google
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true});
            const response = await GoogleSignin.signIn();
            // try both the new style and old style of google sign in result
            const idToken = response.data?.idToken || response.data.idToken;
            if (!idToken) {
                throw new Error("No ID token found from Google sign-in")
            }

            // sign in in Firebase
            const googleCredential = GoogleAuthProvider.credential(idToken);
            const data = await signInWithCredential(auth, googleCredential);
            const user = data.user;

            // sync with database
            const result = await syncWithDatabase(user);
            return result;
        } catch (e) {
            let message = e.message || "Google sign-in failed";
            // catch Google sign-in errors
            if (isErrorWithCode(e)) {
                if (e.code === statusCodes.IN_PROGRESS) {
                    message = "Sign-in is already in progress";
                } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    message = "Google Play Services is not available";
                } else if (e.code === statusCodes.SIGN_IN_CANCELLED) {
                    message = "Sign-in was cancelled";
                }
            } else if (e.code === "auth/account-exists-with-different-credential") {
                message = "This email is registered with email & password - please sign in with email & password"
            }
            return {success: false, message}
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

    const register = async (email, password) => {
        try {
            // create account in Firebase
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = response?.user;
            if (!newUser) {
                throw new Error("Sign up failed")
            }

            // sync with database
            return syncWithDatabase(newUser);
        } catch(e) {
            let message = e.message || "Sign up failed";
            if (e.code === "auth/invalid-email") {
                message = 'Invalid email';
            } else if (e.code === "auth/weak-password") {
                message = "Password too short - password must be at least 6 characters long";
            } else if (e.code === "auth/email-already-in-use") {
                const loginMethod = await fetchSignInMethodsForEmail(auth, email);
                if (loginMethod.includes("google.com")) {
                    message = "This email is already registered - please continue with Google"
                } else if (loginMethod.includes("password")) {
                    message = 'This email is already registered - please sign in instead';
                }
            }
            return {success: false, message};
        }
    }

    return (
        <AuthContext.Provider value = {{ user, isAuthenticated, hasOnboarded, login, logout, register, signInWithGoogle}}>
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