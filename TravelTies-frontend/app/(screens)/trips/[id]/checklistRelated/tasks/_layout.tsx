import { Pressable, Text } from 'react-native'
import React from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'

export default function Layout() {
    const router = useRouter();
    const {id} = useLocalSearchParams();

    return (
        <Stack> 
            <Stack.Screen 
                name="addTask"
                options={{
                    title: "Add task",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace(`/trips/${id}/checklistRelated/checklists?tab=Tasks`)} hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="[taskId]"
                options={{
                    title: "Edit task",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace(`/trips/${id}/checklistRelated/checklists?tab=Tasks`)} hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
        </Stack>
    )
}