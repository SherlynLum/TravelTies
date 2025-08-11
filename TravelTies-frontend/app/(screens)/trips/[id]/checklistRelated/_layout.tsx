import { Pressable } from 'react-native'
import React from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';

export default function Layout() {
    const router = useRouter();
    const {id} = useLocalSearchParams();

    return (
        <Stack> 
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
                    ),
                    headerRight: () => (
                        <Pressable onPress={() => router.push(`/trips/${id}/checklistRelated/completedLists`)} hitSlop={14}>
                            <AntDesign name="checkcircle" size={24} color="white" />
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="completedLists"
                options={{
                    title: "Completed",
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
                name="packing"
                options={{headerShown: false}} />
            <Stack.Screen 
                name="tasks"
                options={{headerShown: false}} />
        </Stack>
    )
}