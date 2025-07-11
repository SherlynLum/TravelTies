import { View, Text, Modal, Pressable, Image, Platform, TouchableOpacity, Switch, Alert } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { JoinRequestsWithProfile, TripParticipant, TripParticipantWithProfile } from '@/types/trips';
import { FlatList } from 'react-native-gesture-handler';
import { Divider } from 'react-native-paper';
import { useAuth } from '@/context/authContext';
import { getRequests, updateRequests } from '@/apis/tripApi';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

type ManageRequestsProps = { 
    isVisible: boolean,
    id: string, 
    closeModal: () => void,
}

const ManageRequestsModal = ({isVisible, id, closeModal} : ManageRequestsProps) => {
    const {user, getUserIdToken} = useAuth();
    const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
    const [requests, setRequests] = useState<JoinRequestsWithProfile[]>([]);
    const [acceptedRequests, setAcceptedRequests] = useState<TripParticipant[]>([]); // without profile for uploading to db
    const [acceptedBuddies, setAcceptedBuddies] = useState<TripParticipantWithProfile[]>([]); // with profile for easy display
    const accepted_uids = useMemo(() => new Set(acceptedBuddies.map(buddy => buddy.participantUid)), 
            [acceptedBuddies]);
    const [declinedUids, setDeclinedUids] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const loadJoinRequests = async () => {
        setLoading(true);
        try {
            const token = await getUserIdToken(user);
            const joinRequests = await getRequests({token, id});
            setRequests(joinRequests);
            setHasError(false);
        } catch (e) {
            console.log(e);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadJoinRequests();
    }, [])

    useEffect(() => {
        const participants = acceptedBuddies.map(({participantUid, role}) => ({participantUid, role}))
        setAcceptedRequests(participants)
    }, [acceptedBuddies])
    
    const isAdmin = (uid: string) => {
        return acceptedBuddies.some(
            buddy => buddy.participantUid === uid && buddy.role === "admin"
        );
    }

    const toggleAdmin = (uid: string) => {
        setAcceptedBuddies(prev => 
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
        setAcceptedBuddies(prev => prev.filter(buddy => buddy.participantUid !== uid))
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

    const handleAccept = (request: JoinRequestsWithProfile) => {
        const newBuddy = {
            participantUid: request.uid,
            role: "member", // initial role will be member
            username: request.username,
            profilePicKey: request.profilePicKey || undefined,
            profilePicUrl: request.profilePicUrl || undefined
        };
        setAcceptedBuddies(prev => [...prev, newBuddy]);
    };

    const handleDecline = (uid: string) => {
        setDeclinedUids(prev => [...prev, uid]);
        setRequests(prev => prev.filter(request => request.uid !== uid));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = await getUserIdToken(user);
            const res = await updateRequests({token, id, acceptedRequests, declinedUids});
            if (!res) {
                throw new Error("No trip is found");
            }
            closeModal();
        } catch (e) {
            console.log(e);
            Alert.alert("Manage join requests", "Failed to update join requests - please try again");
        } finally {
            setLoading(false);
        }
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
                    Manage join requests
                </Text>

                <Pressable onPress={handleSave} disabled={loading} hitSlop={14}>
                    <Text className={`font-semibold ${loading ? "text-neutral-400" : "text-white"} 
                    text-base`}>
                        Save
                    </Text>
                </Pressable>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center bg-white">
                    <Loading size={hp(12)} />
                </View>
            ) : hasError ? (
                <View className="flex-1 justify-center items-center bg-white">
                    <Text className="text-center text-base font-medium italic text-gray-500">
                        {"An error occurred when loading the join requests.\nPlease try again later."}
                    </Text>
                </View>
            ) : (
                <View className="flex-1 bg-white">
                    {/* requests list */}
                    <FlatList
                    data={requests}
                    renderItem={({item}) => {
                        return (
                        <View className="flex flex-row w-full justify-between items-center">
                            <View className="flex flex-row justify-start items-center gap-2"> 
                                <Image source={!item.profilePicUrl 
                                ? require("../../../assets/images/default-user-profile-pic.png")
                                : item.profilePicUrl === "Failed to load" 
                                ? require("../../../assets/images/image-error-icon.png")
                                : {uri: item.profilePicUrl}}
                                className="border-neutral-400 border-2 w-[40px] h-[40px] rounded-[20px]" />
                                <Text className="font-medium text-base text-black">
                                    {item.username}
                                </Text>
                            </View>
                            {
                                !accepted_uids.has(item.uid) ? (
                                <View className="flex flex-row gap-2">
                                    {/* accept button */}
                                    <TouchableOpacity hitSlop={10} onPress={() => handleAccept(item)}
                                    className='bg-green-600 justify-center items-center border 
                                    border-green-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                        <Text className='text-white font-semibold tracking-wider text-sm'>
                                            Accept
                                        </Text>
                                    </TouchableOpacity>

                                    {/* decline button */}
                                    <TouchableOpacity hitSlop={10} onPress={() => handleDecline(item.uid)}
                                    className='bg-red-600 justify-center items-center border 
                                    border-red-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                        <Text className='text-white font-semibold tracking-wider text-sm'>
                                            Decline
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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
                                        <TouchableOpacity hitSlop={10} onPress={() => handleRemove(item.uid, item.username)}
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
                        <View className="flex-1 justify-center items-center bg-white"> 
                            <Text className="text-center text-base font-medium italic text-gray-500">
                            {"There are no join requests"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20}}
                    ItemSeparatorComponent={() => <Divider />}
                    onRefresh={loadJoinRequests}
                    />
                </View>
            )}
        </SafeAreaView>
    </Modal>
  )
}

export default ManageRequestsModal