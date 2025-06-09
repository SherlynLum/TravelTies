import { createContext, useEffect, useState, useContext } from "react";
import { createUserWithEmailAndPassword, getIdToken, onAuthStateChanged, 
    signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential, 
    sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig";
// import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin"

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [emailVerified, setEmailVerified] = useState(null);
    const [hasOnboarded, setHasOnboarded] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                setEmailVerified(user.emailVerified);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setEmailVerified(null);
            }
        })
        return unsubscribe;
    }, [])

    const syncWithDatabase = async (user) => {
        const token = await getIdToken(user);
        const backendRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/sync`, {
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
            if (e.code === "auth/invalid-credential") {
                message = "Incorrect email or password. If your credentials are correct, try signing in with Google or signing up if you don't have an account.";
            } else if (e.code === "auth/invalid-email") {
                message = "Invalid email"
            }
            return {success: false, message};
        }
    }
/* to code using expo go:
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        });
    }, [])
*/

    const signInWithGoogle = async () => {
        /* to code using expo go:
        try {
            // sign in in Google
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true});
            const response = await GoogleSignin.signIn();

            // try both the new style and old style of google sign in result
            const idToken = response.data?.idToken || response?.idToken;
            if (!idToken) {
                throw new Error("Unable to complete Google sign-in")
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
            } else if (e.code === "auth/account-exists-with-different-credential") { // catch Firebase error
                message = "This email is registered with email & password - please sign in with email & password"
            }
            return {success: false, message}
        }
        */
       return;
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
                message = "Password too short - must be at least 6 characters long";
            } else if (e.code === "auth/email-already-in-use") {
                message = "This email is already registered - please sign in or continue with Google"
            }
            return {success: false, message};
        }
    }

    const verifyEmail = async (user) => {
        try {
            const actionCodeSettings = {
                url: "https://travelties-fce2c.web.app",
                handleCodeInApp: true
            };
            await sendEmailVerification(user, actionCodeSettings);
            return {success: true};
        } catch (e) {
            return {success: false, message: "Failed to send verification email - please try clicking the Resend email button",
            error: e.message};
        }
    }

    return (
        <AuthContext.Provider value = {{ user, isAuthenticated, emailVerified, hasOnboarded, 
        login, logout, register, signInWithGoogle, verifyEmail}}>
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