import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthContextProvider, useAuth } from "../context/authContext";
import { useEffect } from "react";

const MainLayout = () => {
  const {isAuthenticated} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // check if user is authenticated or not
    if (typeof isAuthenticated == "undefined") return;
    const inApp = segments[0] === "(screens)";
    if (isAuthenticated && !inApp) {
      // redirect to home
      router.replace("/home");
    } else if (!isAuthenticated) {
      // redirect to signin
      router.replace("/signIn");
    }
  }, [isAuthenticated])

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
  </Stack>
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  )
}
