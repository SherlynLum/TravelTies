import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function _layout() {
    return (
        <Stack> 
            <Stack.Screen 
                name="(tabs)"
                options={{headerShown: false}} />
            <Stack.Screen 
                name="trips"
                options={{headerShown: false}} />
            <Stack.Screen 
                name="settings"
                options={{headerShown: false}} />
        </Stack>
    )
}