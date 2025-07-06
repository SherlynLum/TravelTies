import { View, Text, Modal, Pressable, Image, Platform, TouchableOpacity, Switch } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TripParticipantWithProfile } from '@/types/trips';
import { FlatList } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ManageBuddiesProps = {
    isVisible: boolean,
    buddies: TripParticipantWithProfile[],
    closeModal: () => void,
    complete: (updatedBuddies: TripParticipantWithProfile[]) => void
}

const ManageBuddies = ({isVisible, buddies, closeModal, complete} : ManageBuddiesProps) => {
    const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
    const [updatedBuddies, setUpdatedBuddies] = useState(buddies);
    const [searchTerm, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const uid_set = useMemo(() => new Set(updatedBuddies.map(buddy => buddy.participantUid)), 
        [updatedBuddies])
    
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (searchTerm.trim()) 
        })
    })

    const toggleAdmin = (uid: string) => {
        setUpdatedBuddies(prev => 
            prev.map(buddy => 
                buddy.participantUid === uid // if is the buddy that is toggling 
                ? {
                    ...buddy, // other field remains the same
                    role: buddy.role === "admin" ? "member" : "admin" // if current role is admin, after toggling will become member, vice versa
                } : buddy
            )
        )
    };

    const removeBuddy = (uid: string) => {
        setUpdatedBuddies(prev => prev.filter(buddy => buddy.participantUid !== uid))
    };

    const handleSave = () => {
        complete(updatedBuddies);
    }

  return (
    <Modal visible={isVisible} animationType="slide">
        <SafeAreaView className="flex-1 bg-header">
            <StatusBar 
                translucent
                backgroundColor="transparent"
                style="light"
            />

            {/* header */}
            <View style={{paddingHorizontal: 16, height: HEADER_HEIGHT, width: "100%"}}
            className="flex-row items-center justify-between">
                <Pressable onPress={closeModal} hitSlop={14}>
                    <Text className="font-semibold text-white text-base">
                        Cancel
                    </Text>
                </Pressable>

                <Text className="font-bold text-white text-base">
                    Add trip buddies
                </Text>

                <Pressable onPress={handleSave} hitSlop={14}>
                    <Text className="font-semibold text-white text-base">
                        Save
                    </Text>
                </Pressable>
            </View>

            {/* search bar */}
            <View className="px-5 py-5 items-center justify-center">
                <TouchableOpacity>
                    <View className="flex flex-row items-center justify-start px-4 bg-gray-200 h-11
                    rounded-5 gap-4">
                        <FontAwesome name="search" size={15} color="#9CA3AF"/>
                        <Text className="text-gray-400 font-medium text-base">
                        Search by username
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* buddy list */}
            <FlatList
            data={updatedBuddies}
            renderItem={({item}) => {
                return (
                <View className="flex flex-row w-full justify-between items-center">
                    <View className="flex flex-row justify-start items-center gap-2"> 
                        <Image source={!item.profilePicUrl 
                        ? require("../../../assets/images/default-user-profile-pic.png")
                        : item.profilePicUrl === "Failed to load" 
                        ? {uri: `https://placehold.co/40x40?text=!`}
                        : {uri: item.profilePicUrl}}
                        className="border-neutral-400 border-2 w-[40px] h-[40px] rounded-[20px]" />
                        <Text className="font-medium text-base text-black">
                            {item.username}
                        </Text>
                    </View>
                    {
                        item.role === "creator" ? (
                            <Text className="font-medium text-base text-gray-500">
                                Creator
                            </Text>
                        ) : (
                            <View className="flex flex-row gap-2">
                                {/* admin toggle */}
                                <View className="flex flex-row gap-1">
                                    <Text className="font-medium text-base text-gray-500">
                                        {"Admin: "}
                                    </Text>
                                    <Switch 
                                    value={item.role === "admin"}
                                    onValueChange={() => toggleAdmin(item.participantUid)}
                                    />
                                </View>

                                {/* remove button */}
                                <TouchableOpacity hitSlop={10} onPress={() => removeBuddy(item.participantUid)}
                                className='bg-red-600 justify-center items-center border 
                                border-red-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                    <Text className='text-white font-semibold tracking-wider text-sm'>
                                        Remove
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </View> 
            )}}
            keyExtractor={(item) => item.participantUid}
            ListEmptyComponent={
                <View className="flex-1 justify-center items-center"> 
                    <Text className="text-center text-base font-medium italic text-gray-500">
                    {"You haven't added any buddies for this trip.\nTap the blue button above to add trip buddies."}
                    </Text>
                </View>
            }
            contentContainerStyle={{flexGrow: 1, justifyContent: "center", alignItems: "center",
            paddingHorizontal: 20, paddingVertical: 20}}
            />
        </SafeAreaView>
    </Modal>
  )
}

export default ManageBuddies