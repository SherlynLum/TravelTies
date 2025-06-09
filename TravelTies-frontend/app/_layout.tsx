import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthContextProvider, useAuth } from "../context/authContext";
import { useEffect } from "react";

const MainLayout = () => {
  const {isAuthenticated, emailVerified, hasOnboarded} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    } 
    const currentPosition = segments[0];
    if (!isAuthenticated && currentPosition !== "signIn" && currentPosition !== "signUp") {
      // redirect to signIn
      router.replace("/signIn");
    } else if (isAuthenticated) {
      if (emailVerified === null) {
        return;
      } else if (!emailVerified && currentPosition !== "emailVerification") {
        // redirect to email verification page
        router.replace("/emailVerification");
      } else if (emailVerified) {
        if (hasOnboarded === null) {
          return;
        } else if (!hasOnboarded && currentPosition !== "onboard") {
          router.replace("/onboard");
        } else if (hasOnboarded && currentPosition !== "(screens)") {
          router.replace("/home");
        }
      }
    }
  }, [isAuthenticated, emailVerified, hasOnboarded]) // only redirect if isAuthenticated/emailVerified/hasOnboarded changes

/* for convenience in coding specific page:
  useEffect(() => {
    // delay redirect a tiny bit to avoid navigating too early
    const timeout = setTimeout(() => {
      router.replace("/emailVerification");
    }, 50); // 50ms delay usually works well

    return () => clearTimeout(timeout);
  }, []);
*/
  
  return <Stack>
    <Stack.Screen
      name = "index"
      options = {{ headerShown: false }}
    />
    <Stack.Screen
      name = "signIn"
      options = {{ headerShown: false }}
    />
    <Stack.Screen
      name = "signUp"
      options = {{ headerShown: false }}
    />
    <Stack.Screen
      name = "emailVerification"
      options = {{ headerShown: false }}
    />
    <Stack.Screen
      name = "onboard"
      options = {{ headerShown: false }}
    />
    <Stack.Screen
      name = "forgotPassword"
      options = {{ headerShown: false }}
    />
  </Stack>
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  )
}
