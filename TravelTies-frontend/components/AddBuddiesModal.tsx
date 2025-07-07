import { View, Text, Modal, Pressable, Image, Platform, TouchableOpacity, Switch, TextInput } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TripParticipantWithProfile } from '@/types/trips';
import { FlatList } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/authContext';
import { User } from "@/types/users";
import { getFriends, searchFriends } from '@/apis/userApi';
import Loading from './Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Divider } from 'react-native-paper';

type AddBuddiesProps = {
    isVisible: boolean,
    buddies: TripParticipantWithProfile[],
    closeModal: () => void,
    complete: (updatedBuddies: TripParticipantWithProfile[]) => void
}

const AddBuddiesModal = ({isVisible, buddies, closeModal, complete} : AddBuddiesProps) => {
    const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
    const [updatedBuddies, setUpdatedBuddies] = useState(buddies);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const uid_set = useMemo(() => new Set(updatedBuddies.map(buddy => buddy.participantUid)), 
        [updatedBuddies])
    const [friends, setFriends] = useState<User[]>([]);
    const {user, getUserIdToken} = useAuth();
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        setLoading(true);

        const timeout = setTimeout(async () => {
            try{
                const token = await getUserIdToken(user);
                const cleanedSearchTerm = searchTerm.trim();
                if (cleanedSearchTerm) {
                    const results = await searchFriends(token, cleanedSearchTerm);
                    setFriends(results);
                } else {
                    const results = await getFriends(token);
                    setFriends(results)
                }
                setHasError(false);
            } catch (e) {
                console.log(e);
                setHasError(true);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchTerm])

    const handleAdd = (friend: User) => {
        const newBuddy = {
            participantUid: friend.uid,
            role: "member", // initial role will be member
            username: friend.username,
            profilePicKey: friend.profilePicKey || undefined,
            profilePicUrl: friend.profilePicUrl || undefined
        };
        setUpdatedBuddies(prev => [...prev, newBuddy]);
    };

    const isAdmin = (uid: string) => {
        return updatedBuddies.some(
            buddy => buddy.participantUid === uid && buddy.role === "admin"
        );
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
            <View className="px-5 py-5 items-center justify-center bg-white">
                <View className="flex flex-row items-center justify-start px-4 bg-gray-200 h-11
                rounded-5 gap-4">
                    <FontAwesome name="search" size={15} color="#9CA3AF"/>
                    <TextInput
                        autoCapitalize="none"
                        value={searchTerm}
                        onChangeText={value => setSearchTerm(value)}
                        className='flex-1 font-medium text-black text-base'
                        placeholder='Search by username'
                        placeholderTextColor={'gray'}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            {/* friends list */}
            {loading ? (
                <View className="flex-1 justify-center items-center px-5 bg-white">
                    <Loading size={hp(12)} />
                </View>
            ) : hasError ? (
                <View className="flex-1 justify-center items-center px-5 bg-white"> 
                    <Text className="text-center text-base font-medium italic text-gray-500">
                    {"An error occurred when loading your friends list.\nPlease try again later."}
                    </Text>
                </View>
            ) : (
                <View className="flex-1 bg-white">
                    <FlatList
                    data={friends}
                    renderItem={({item}) => {
                        return (
                        <View className="flex flex-row w-full justify-between items-center">
                            <View className="flex flex-row justify-start items-center gap-2"> 
                                <Image source={!item.profilePicUrl 
                                ? require("../../../assets/images/default-user-profile-pic.png")
                                : item.profilePicUrl === "Failed to load" 
                                ? require("../../../assets/images/error-icon.png")
                                : {uri: item.profilePicUrl}}
                                className="border-neutral-400 border-2 w-[40px] h-[40px] rounded-[20px]" />
                                <Text className="font-medium text-base text-black">
                                    {item.username}
                                </Text>
                            </View>
                            {
                                !uid_set.has(item.uid) ? (
                                    <TouchableOpacity onPress={() => handleAdd(item)} hitSlop={10}
                                    className='bg-blue-500 justify-center items-center border 
                                    border-blue-600 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                        <Text className='text-white font-semibold tracking-wider text-sm'>
                                            Add to trip
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex flex-row gap-2">
                                        {/* admin toggle */}
                                        <View className="flex flex-row gap-1">
                                            <Text className="font-medium text-base text-gray-500">
                                                {"Admin: "}
                                            </Text>
                                            <Switch 
                                            value={isAdmin(item.uid)}
                                            onValueChange={() => toggleAdmin(item.uid)}
                                            />
                                        </View>

                                        {/* remove button */}
                                        <TouchableOpacity hitSlop={10} onPress={() => removeBuddy(item.uid)}
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
                    keyExtractor={(item) => item.uid}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center"> 
                            <Text className="text-center text-base font-medium italic text-gray-500">
                            {"No friends found"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{flexGrow: 1, justifyContent: "center", alignItems: "center",
                    paddingHorizontal: 20, paddingVertical: 20}}
                    ItemSeparatorComponent={() => <Divider />}
                    />
                </View>
            )}
        </SafeAreaView>
    </Modal>
  )
}

export default AddBuddiesModal