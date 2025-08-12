import { View, Text } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function _layout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#4B9EFF",
            tabBarInactiveTintColor: "#A0A0A0"
        }}>
            <Tabs.Screen
                name="tripsDashboard"
                options={{
                    title: "Trips",
                    tabBarIcon: ({focused}) => (
                        <MaterialCommunityIcons name="bag-suitcase" size={24} 
                        color={focused ? "#4B9EFF" : "#A0A0A0"}/>
                    )
                }}
            />
            <Tabs.Screen
                name="discover"
                options={{
                    title: "Discover",
                    tabBarIcon: ({focused}) => (
                       <FontAwesome5 name="compass" size={22} 
                       color={focused ? "#4B9EFF" : "#A0A0A0"}/>
                    ),
                    href: null // hide discover tab since haven't implement yet
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({focused}) => (
                        <MaterialIcons name="person" size={24} 
                        color={focused ? "#4B9EFF" : "#A0A0A0"}/>
                    )
                }}
            />
        </Tabs>
    )
}