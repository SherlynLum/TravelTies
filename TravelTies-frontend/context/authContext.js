import { createContext, useEffect, useState, useContext } from "react";
import { createUserWithEmailAndPassword, getIdToken, onAuthStateChanged, 
    signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential, 
    sendEmailVerification, sendPasswordResetEmail, reload } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin"
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isSynced, setIsSynced] = useState(null);
    const [emailVerified, setEmailVerified] = useState(null);
    const [hasOnboarded, setHasOnboarded] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                setEmailVerified(user.emailVerified);
                try {
                    await syncWithDatabase(user); // sync with database every time the app reloads or user logs in
                } catch (e) {
                    console.log(e.message);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setIsSynced(null);
                setEmailVerified(null);
                setHasOnboarded(null);
            }
        })
        return unsubscribe;
    }, [])

    const getUserIdToken = async (user) => { // mainly for usage outside Auth context 
        return await getIdToken(user);
    }

    const syncWithDatabase = async (user) => {
        try {
            const token = await getUserIdToken(user);
            const backendRes = await axios.post(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/sync`, 
                {}, 
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            const backendResJson = backendRes?.data; // get the json response

            if (!backendResJson || backendResJson.data === undefined || 
                backendResJson.onboard === undefined) {
                throw new Error("Failed to load data")
            }

            console.log(backendResJson)
            setHasOnboarded(backendResJson.onboard);
            setIsSynced(true)
            return {success: true, data: backendResJson.data}
        } catch (e) {
            setIsSynced(false);
            await signOut(auth); // sign-in succeeded but database sync failed so sign out to keep state atomic
            throw new Error(e.response?.data.message || "Failed to load data"); // get the message field in response
        }
    }

    const login = async (email, password) => {
        try {
            // sign in with Firebase
            const response = await signInWithEmailAndPassword(auth, email, password);
            const user = response?.user;
            if (!user) {
                throw new Error("Sign in failed");
            }

            // sync with database
            const result = await syncWithDatabase(user);
            return result;
        } catch (e) {
            let message = e.message || "Sign in failed";
            if (e.code === "auth/invalid-credential") {
                message = "Incorrect email or password. If your credentials are correct, try signing in with Google or signing up if you don't have an account.";
            } else if (e.code === "auth/invalid-email") {
                message = "Invalid email"
            } else if (e.code === "auth/too-many-requests") {
                message = "Too many requests have been sent - please wait before trying again"
            } else if (e.code === "auth/network-request-failed") {
                message = "No Internet connection detected - please check your network"
            }
            return {success: false, message};
        }
    }
/* to code using expo go: */
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        });
    }, [])
/**/

    const signInWithGoogle = async () => {
        /* to code using expo go: */
        try {
            // sign in in Google
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true});
            const response = await GoogleSignin.signIn();
            console.log("Google Sign in response:", response);

            // try both the new style and old style of google sign in result
            const idToken = response.data?.idToken || response?.idToken;
            if (!idToken) {
                throw new Error("Unable to complete Google sign-in")
            }

            // sign in in Firebase
            const googleCredential = GoogleAuthProvider.credential(idToken);
            console.log("googleCredential:", googleCredential);
            const data = await signInWithCredential(auth, googleCredential);
            const user = data?.user;
            if (!user) {
                throw new Error("Google sign-in failed")
            }

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
            } else if (e.code === "auth/account-exists-with-different-credential") { // catch Firebase error
                message = "This email is registered with email & password - please sign in with email & password"
            } else if (e.code === "auth/too-many-requests") {
                message = "Too many requests have been sent - please wait before trying again"
            } else if (e.code === "auth/network-request-failed") {
                message = "No Internet connection detected - please check your network"
            }
            return {success: false, message}
        }
        
        /* return; */
    }

    const logout = async () => {
        try {
            await signOut(auth);
            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
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
                message = "Invalid email";
            } else if (e.code === "auth/weak-password") {
                message = "Password too short - must be at least 6 characters long";
            } else if (e.code === "auth/email-already-in-use") {
                message = "This email is already registered - please sign in or continue with Google"
            } else if (e.code === "auth/too-many-requests") {
                message = "Too many requests have been sent - please wait before trying again"
            } else if (e.code === "auth/network-request-failed") {
                message = "No Internet connection detected - please check your network"
            }
            return {success: false, message};
        }
    }

    const verifyEmail = async (user) => {
        try {
            /* self-coded email verification page is not working, comment out for now
            const actionCodeSettings = {
                url: "https://travelties-fce2c.firebaseapp.com",
                handleCodeInApp: false
            }; */
            await sendEmailVerification(user); // with actionCodeSettings: await sendEmailVerification(user, actionCodeSettings);
            return {success: true};
        } catch (e) {
            let message = e.message || "Failed to send verification email";
            if (e.code === "auth/too-many-requests") {
                message = "Too many requests have been sent - please wait before trying again"
            } else if (e.code === "auth/network-request-failed") {
                message = "No Internet connection detected - please check your network"
            }
            return {success: false, message};
        }
    }

    const validateEmailVerification = async () => {
        if (!user) { // if there is no user, although highly unlikely as if no user, they should not even be on email verification page
            setIsAuthenticated(false); // immediately redirect away
            setUser(null);
            setIsSynced(null);
            setEmailVerified(null);
            setHasOnboarded(null);
        } 
        try{
            await reload(user); 
            setEmailVerified(user.emailVerified);
            if (user.emailVerified) {
                return {success: true};
            } else {
                return {success: false, message: "Email is not yet verified - please try again"}
            }
        } catch (e) {
            return {success:false, message: e.message};
        }
    }

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return {success: true};
        } catch (e) {
            let message = e.message || "Failed to send reset password email";
            if (e.code === "auth/invalid-email") {
                message = "Invalid email";
            } else if (e.code === "auth/too-many-requests") {
                message = "Too many requests have been sent - please wait before trying again"
            } else if (e.code === "auth/network-request-failed") {
                message = "No Internet connection detected - please check your network"
            }
            return {success: false, message};
        }
    }

    return (
        <AuthContext.Provider value = {{ user, isAuthenticated, isSynced, emailVerified, 
        hasOnboarded, setHasOnboarded, login, logout, register, signInWithGoogle, verifyEmail, 
        validateEmailVerification, resetPassword, getUserIdToken}}>
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