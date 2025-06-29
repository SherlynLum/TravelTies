import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/authContext';

const Profile = () => {
  const {logout} = useAuth();
  const handleLogout = async () => {
    await logout();
  }
  return (
    <View className='flex-1 items-center justify-center'>
      <Text>Profile</Text>
      <Pressable onPress={handleLogout}>
        <Text>Sign out</Text>
      </Pressable>
    </View>
  )
}

export default Profile