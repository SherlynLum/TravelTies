import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';

export default function Layout() {
    const router = useRouter();
    const {id} = useLocalSearchParams();
    const { showActionSheetWithOptions } = useActionSheet();

    const handleAddCard = () => {
        const options = ["Add Note card", "Add Destination card", "Add Transportation card", 
            "Add General card", "Cancel"];
        const cancelButtonIndex = 4;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex
            },
            (selectedIndex) => {
                if (selectedIndex === 0) {
                    setTimeout(() => {
                        router.replace(`/trips/${id}/addNoteCard`);
                    }, 0);
                } else if (selectedIndex === 1) {
                    setTimeout(() => {
                        router.replace(`/trips/${id}/addDestinationCard`);
                    }, 0);
                } else if (selectedIndex === 2) {
                    setTimeout(() => {
                        router.replace(`/trips/${id}/addTransportationCard`);
                    }, 0);
                } else if (selectedIndex === 3) {
                    setTimeout(() => {
                        router.replace(`/trips/${id}/addGeneralCard`);
                    }, 0);
                }
            }
        )
    }

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
                            <Pressable onPress={() => router.replace(`/trips/${id}/editTripDetails`)} hitSlop={14}>
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
                        <Pressable onPress={() => router.replace(`/trips/${id}/overview`)} hitSlop={14} className="pr-5">
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <Pressable onPress={handleAddCard} hitSlop={14}>
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
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
                        <Pressable onPress={() => router.back()} hitSlop={14} className="pr-5">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="addNoteCard"
                options={{
                    title: "Add Note card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace(`/trips/${id}/itinerary`)} hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="addDestinationCard"
                options={{
                    title: "Add Destination card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace(`/trips/${id}/itinerary`)} hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="addTransportationCard"
                options={{
                    title: "Add Transportation card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace(`/trips/${id}/itinerary`)} hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="addGeneralCard"
                options={{
                    title: "Add General card",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace(`/trips/${id}/itinerary`)} hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="[cardId]"
                options={{headerShown: false}} />
        </Stack>
    )
}