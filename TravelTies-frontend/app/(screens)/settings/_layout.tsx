import { Pressable } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Layout() {
    const router = useRouter();
    return (
        <Stack> 
            <Stack.Screen 
                name="addFriends"
                options={{
                    title: "Add friend",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="editProfile"
                options={{
                    title: "Edit profile",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="friends"
                options={{
                    title: "Friends",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <Pressable onPress={() => router.push("/settings/addFriends")} hitSlop={14} className="pr-5">
                            <MaterialIcons name="person-add-alt-1" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="joinTrip"
                options={{
                    title: "Join a trip",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="privacyPolicy"
                options={{
                    title: "View privacy policy",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="rateUs"
                options={{
                    title: "Rate us",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="resetPassword"
                options={{
                    title: "Reset password",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="support"
                options={{
                    title: "Tutorial & Support",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="unableResetPassword"
                options={{
                    title: "Reset password",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "bold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.push("/profile")} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
        </Stack>
    )
}