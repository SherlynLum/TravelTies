import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/authContext';

const Home = () => {
    const {logout} = useAuth();
    const handleLogout = async () => {
      await logout();
    }
  return (
    <View>
      <Text>Home</Text>
      <Pressable onPress={handleLogout}>
        <Text>Sign out</Text>
      </Pressable>
    </View>
  )
}

export default Home