import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthContextProvider, useAuth } from "../context/authContext";
import { useEffect } from "react";

const MainLayout = () => {
  const {isAuthenticated, hasOnboarded} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated === "undefined") {
      return;
    } 
    const currentPosition = segments[0];
    if (!isAuthenticated && currentPosition !== "signIn" && currentPosition !== "signUp") {
      // redirect to signIn
      router.replace("/signIn");
    } else if (isAuthenticated) {
      if (typeof hasOnboarded === "undefined") {
        // redirect to index as it will show loading 
        router.replace("/");
      } else if (!hasOnboarded && currentPosition !== "onboard") {
      // redirect to onboard
      router.replace("/onboard")
      } else if (hasOnboarded && currentPosition !== "(screens)") {
        router.replace("/home")
      }
    }
  }, [isAuthenticated, hasOnboarded]) // only redirect if isAuthenticated or hasOnboarded changes

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
      name = "onboard"
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
