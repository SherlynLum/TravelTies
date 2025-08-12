import { Pressable, Text } from 'react-native'
import React from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'

export default function Layout() {
    const router = useRouter();
    const {id} = useLocalSearchParams();

    return (
        <Stack> 
            <Stack.Screen 
                name="addItem"
                options={{
                    title: "Add item",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => 
                            router.replace(`/trips/${id}/checklistRelated/checklists?tab=Packing`)
                        } 
                        hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
            <Stack.Screen 
                name="[itemId]"
                options={{
                    title: "Edit item",
                    headerStyle: {backgroundColor: "#6495ED"},
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: "semibold"
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => 
                            router.replace(`/trips/${id}/checklistRelated/checklists?tab=Packing`)
                        }
                        hitSlop={14} className="pr-5">
                            <Text className="font-semibold text-white text-base">
                                Cancel
                            </Text>
                        </Pressable>
                    )
                }} />
        </Stack>
    )
}