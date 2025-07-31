import { View, Text, Modal, Pressable, Image, Platform, TouchableOpacity, Switch, Alert, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TripParticipantWithProfile } from '@/types/trips';
import AddBuddiesModal from './AddBuddiesModal';
import { Divider } from 'react-native-paper';

type ManageBuddiesProps = {
    isVisible: boolean,
    buddies: TripParticipantWithProfile[],
    currentUid: string,
    closeModal: () => void,
    complete: (updatedBuddies: TripParticipantWithProfile[]) => void
}

const ManageBuddiesModal = ({isVisible, buddies, currentUid, closeModal, complete} : ManageBuddiesProps) => {
    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
    const [updatedBuddies, setUpdatedBuddies] = useState(buddies);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const closeAddModal = () => {
        setAddModalOpen(false);
    }

    const completeAddModal = (newBuddies: TripParticipantWithProfile[]) => {
        setUpdatedBuddies(newBuddies);
        setAddModalOpen(false);
    }
    
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

    const handleRemove = (uid: string, username: string) => {
        Alert.alert("Remove buddy", `Are you sure you want to remove ${username} from this trip?`,
            [
                {
                text: "No",
                style: "cancel"
                }, 
                {
                text: "Yes",
                style: "destructive",
                onPress: () => removeBuddy(uid)
                }
            ]
        )
    }

    const handleSave = () => {
        complete(updatedBuddies);
    }

  return (
    <Modal visible={isVisible} animationType="slide">
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <View className="flex-1 bg-header" style={{paddingTop: insets.top}}>
            {/* header */}
            <View style={{paddingHorizontal: 16, height: HEADER_HEIGHT, width: "100%"}}
            className="flex-row items-center justify-between">
                <Pressable onPress={closeModal} hitSlop={14}>
                    <Text className="font-semibold text-white text-base">
                        Cancel
                    </Text>
                </Pressable>

                <Text className="font-bold text-white text-base">
                    Manage trip buddies
                </Text>

                <Pressable onPress={handleSave} hitSlop={14}>
                    <Text className="font-semibold text-white text-base">
                        Save
                    </Text>
                </Pressable>
            </View>

            <View className="flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
                {/* add button to open add modal */}
                <View className="px-5 py-5 items-center justify-center">
                    <TouchableOpacity onPress={() => setAddModalOpen(true)}
                    className='bg-blue-500 justify-center items-center border 
                    border-blue-600 shadow-sm h-[44px] px-8 rounded-[30px]'>
                        <Text className='text-white font-semibold tracking-wider text-sm'>
                            Add trip buddies from your friends list
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* buddy list */}
                <FlatList
                data={updatedBuddies}
                renderItem={({item}) => {
                    return (
                    <View className="flex flex-row w-full justify-between items-center py-3">
                        <View className="flex flex-row justify-start items-center gap-2"> 
                            <Image source={!item.profilePicUrl 
                            ? require("../assets/images/default-user-profile-pic.png")
                            : item.profilePicUrl === "Failed to load" 
                            ? require("../assets/images/image-error-icon.png")
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
                            ) : item.participantUid === currentUid ? (
                                <Text className="font-medium text-base text-gray-500">
                                    {item.role.charAt(0).toUpperCase() + item.role.slice(1)} 
                                </Text>
                            ) : (
                                <View className="flex flex-row gap-2">
                                    {/* admin toggle */}
                                    <View className="flex flex-row gap-1 items-center">
                                        <Text className="font-medium text-base text-gray-500">
                                            {"Admin: "}
                                        </Text>
                                        <Switch 
                                        value={item.role === "admin"}
                                        onValueChange={() => toggleAdmin(item.participantUid)}
                                        />
                                    </View>

                                    {/* remove button */}
                                    <TouchableOpacity hitSlop={10} onPress={() => handleRemove(item.participantUid, item.username)}
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
                    <View className="flex-1 justify-center items-center bg-white"> 
                        <Text className="text-center text-base font-medium italic text-gray-500">
                        {"You haven't added any buddies for this trip.\nTap the blue button above to add trip buddies."}
                        </Text>
                    </View>
                }
                contentContainerStyle={{flexGrow: 1, paddingHorizontal: 20}}
                ItemSeparatorComponent={() => <Divider />}
                />
            </View>
            <AddBuddiesModal isVisible={addModalOpen} buddies={updatedBuddies} 
            closeModal={closeAddModal} complete={completeAddModal}/>
        </View>
    </Modal>
  )
}

export default ManageBuddiesModal