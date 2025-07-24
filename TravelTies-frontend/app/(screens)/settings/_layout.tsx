import { Pressable } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
    const router = useRouter();
    return (
        <Stack> 
            <Stack.Screen 
                name=""
                options={{
                    title: "",
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
        </Stack>
    )
}