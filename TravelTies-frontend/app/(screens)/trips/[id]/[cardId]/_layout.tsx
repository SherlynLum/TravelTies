import { Text, Pressable } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
    const router = useRouter();

    return (
        <Stack> 
            <Stack.Screen 
                name="cardDetails"
                options={{
                    title: "",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14}>
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="editNoteCard"
                options={{
                    title: "Edit Note card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14}>
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="editDestinationCard"
                options={{
                    title: "Edit Destination card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14}>
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="editTransportationCard"
                options={{
                    title: "Edit Transportation card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14}>
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="editGeneralCard"
                options={{
                    title: "Edit General card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14}>
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
        </Stack>
    )
}