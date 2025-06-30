import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthContextProvider, useAuth } from "../context/authContext";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MainLayout = () => {
  const {isAuthenticated, isSynced, emailVerified, hasOnboarded} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    } 

    const currentPosition = segments[0];
    console.log(hasOnboarded);
    if (!isAuthenticated && currentPosition !== "signIn" && currentPosition !== "signUp" 
      && currentPosition !== "forgotPassword") {
      // redirect to signIn
      router.replace("/signIn");
    } else if (isAuthenticated && isSynced) { // if isSynced is false or null, isAuthenticated will always be false or null, so no need to check !isAuthenticated && !isSynced
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
          router.replace("/tripsDashboard");
        }
      }
    } // only redirect if isAuthenticated/isSynced/emailVerified/hasOnboarded changes
  }, [isAuthenticated, isSynced, emailVerified, hasOnboarded]) 


/* for convenience in coding specific page: 
  useEffect(() => {
    // delay redirect a tiny bit to avoid navigating too early
    const timeout = setTimeout(() => {
      router.replace("/tripsDashboard");
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
    <Stack.Screen
      name = "(screens)"
      options = {{ headerShown: false }}
    />
  </Stack>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContextProvider>
        <PaperProvider>
          <MainLayout /> 
        </PaperProvider>
      </AuthContextProvider>
    </GestureHandlerRootView>
  )
}
