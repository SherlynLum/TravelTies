import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Layout() {
    const router = useRouter();
    const {id} = useLocalSearchParams();

    return (
        <Stack> 
            <Stack.Screen 
                name="overview"
                options={{
                    title: "",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-4">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <View className="flex flex-row gap-7 justify-center items-center pl-4">
                            <Pressable onPress={() => router.push(`/trips/${id}/editTripDetails`)} hitSlop={14}>
                                <FontAwesome6 name="edit" size={20} color="white" />
                            </Pressable>
                            <Pressable onPress={() => router.push(`/trips/${id}/displayTripInfo`)} hitSlop={14}>
                                <MaterialCommunityIcons name="information-outline" size={24} color="white" />
                            </Pressable>
                        </View>
                    )
                }} />
            <Stack.Screen 
                name="editTripDetails"
                options={{
                    title: "Edit trip details",
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
                name="displayTripInfo"
                options={{
                    title: "View trip info",
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
                name="itinerary"
                options={{
                    title: "Itinerary",
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
                    ),
                    headerRight: () => (
                        <Pressable onPress={() => router.push("/(screens)/trips/[id]/addCard")} hitSlop={14}>
                            <Ionicons name="add-circle" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="polls"
                options={{
                    title: "Polls",
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
                name="checklists"
                options={{
                    title: "Checklists",
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
                name="expenseTracker"
                options={{
                    title: "Expense tracker",
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
                name="gallery"
                options={{
                    title: "Gallery",
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
                name="recommendations"
                options={{
                    title: "Travel recommendations",
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
        </Stack>
    )
}