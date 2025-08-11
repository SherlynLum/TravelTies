import { View, Text, TextInput, FlatList, Image, TouchableOpacity, Alert, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FriendRequest, User } from '@/types/users';
import { useAuth } from '@/context/authContext';
import { acceptRequest, getFriends, getRequests, removeFriendOrRequest, searchFriends } from '@/apis/userApi';
import { Divider } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Entypo from '@expo/vector-icons/Entypo';

const Friends = () => {
    const insets = useSafeAreaInsets();
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState<User[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const {user, getUserIdToken} = useAuth();
    const [friendsHasErr, setFriendsHasErr] = useState(false);
    const [requestHasErr, setRequestsHasErr] = useState(false);
    const screenWidth = Dimensions.get("window").width;
    const tabWidth = (screenWidth - 20 * 3) / 2 // padding 20 at each end and a gap of 20
    const [tab, setTab] = useState("My friends"); // default to my friends when first render
    
    useEffect(() => {
        setLoading(true);

        const getFriendRequests = async () => {
            try {
                const token = await getUserIdToken(user);
                const friendRequests = await getRequests(token);
                setRequests(friendRequests);
                setRequestsHasErr(false);
            } catch (e) {
                console.log(e);
                setRequestsHasErr(true);
            } finally {
                setLoading(false);
            }
        }
        if (tab === "Requests") {
            setSearchTerm("");
            getFriendRequests();
            return;
        }

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
                setFriendsHasErr(false);
            } catch (e) {
                console.log(e);
                setFriendsHasErr(true);
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchTerm, tab])

    const removeFriend = async (exFriendUid: string, exFriendName: string) => {
        try {
            const token = await getUserIdToken(user);
            await removeFriendOrRequest({token, exFriendUid});
            setFriends(prev => prev.filter(friend => friend.uid !== exFriendUid));
        } catch (e) {
            console.log(e);
            Alert.alert("Remove friend", `Unable to remove ${exFriendName} from your friends list - please try again later`);
        }
    }

    const handleRemoveFriend = (exFriendUid: string, exFriendName: string) => {
        Alert.alert("Remove friend", `Are you sure you want to remove ${exFriendName} from your friends list?`, [
            {
                text: "No",
                style: "cancel"
            },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => removeFriend(exFriendUid, exFriendName)
            }
        ])
    } 

    const handleAcceptRequest = async (newFriendUid: string, newFriendName: string) => {
        try {
            const token = await getUserIdToken(user);
            await acceptRequest({token, newFriendUid});
            setRequests(prev => prev.filter(request => request.uid !== newFriendUid));
        } catch (e) {
            console.log(e);
            Alert.alert("Accept friend request", `Unable to add ${newFriendName} to your friends list - please try again later`);
        }
    }

    const declineRequest = async (exFriendUid: string, exFriendName: string) => {
        try {
            const token = await getUserIdToken(user);
            await removeFriendOrRequest({token, exFriendUid});
            setRequests(prev => prev.filter(request => request.uid !== exFriendUid));
        } catch (e) {
            console.log(e);
            Alert.alert("Decline friend request", `Unable to decline ${exFriendName}'s friend request - please try again later`);
        }
    }

    const handleDeclineRequest = (exFriendUid: string, exFriendName: string) => {
        Alert.alert("Decline friend request", `Are you sure you want to decline ${exFriendName}'s friend request?`, [
            {
                text: "No",
                style: "cancel"
            },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => declineRequest(exFriendUid, exFriendName)
            }
        ])
    } 

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <View className="flex-1 flex-col gap-3 items-center justify-center pt-6 bg-white" 
        style={{paddingBottom: insets.bottom}}>
            {/* tabs */}
            <View className="flex flex-row gap-5 items-center justify-center px-5">
            {["My friends", "Requests"].map(tabName => (
                <TouchableOpacity
                key={tabName} onPress={() => setTab(tabName)} hitSlop={5}
                style={{width: tabWidth}}
                className={`bg-white justify-center items-center shadow-sm h-[35px] px-8 rounded-[30px] 
                ${tab === tabName ? "border-blue-500 border-2": "border-gray-500 border"}`}>
                    <Text className={`font-semibold ${tab === tabName ? "text-blue-500" : "text-gray-500"}
                    text-sm`}>
                        {tabName}
                    </Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* search bar */}
            {tab === "My friends" && (
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
            )}

            {/* friends list or requests list */}
            {loading ? (
                <View className="flex-1 justify-center items-center px-5 bg-white">
                    <Loading size={hp(12)} />
                </View>
            ) : (tab === "My friends" && friendsHasErr) ? (
                <View className="flex-1 justify-center items-center px-5 bg-white"> 
                    <Text className="text-center text-base font-medium italic text-gray-500">
                        {"An error occurred when loading your friends list.\nPlease try again later."}
                    </Text>
                </View>
            ) : (tab === "Requests" && requestHasErr) ? (
                <View className="flex-1 justify-center items-center px-5 bg-white"> 
                    <Text className="text-center text-base font-medium italic text-gray-500">
                        {"An error occurred when loading your friend requests.\nPlease try again later."}
                    </Text>
                </View>
            ) : (
                <View className="flex-1 bg-white">
                    <FlatList
                    data={tab === "My friends" ? friends : requests}
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
                            {tab === "My friends" ? (
                                <TouchableOpacity onPress={() => handleRemoveFriend(item.uid, item.username)}
                                hitSlop={16}>
                                    <Entypo name="cross" size={24} color="black" />
                                </TouchableOpacity>
                            ) : (
                                <View className="flex flex-row gap-2">
                                    {/* accept button */}
                                    <TouchableOpacity hitSlop={10} onPress={() => handleAcceptRequest(item.uid, item.username)}
                                    className='bg-green-600 justify-center items-center border 
                                    border-green-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                        <Text className='text-white font-semibold tracking-wider text-sm'>
                                            Accept
                                        </Text>
                                    </TouchableOpacity>

                                    {/* decline button */}
                                    <TouchableOpacity hitSlop={10} onPress={() => handleDeclineRequest(item.uid, item.username)}
                                    className='bg-red-600 justify-center items-center border 
                                    border-red-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                        <Text className='text-white font-semibold tracking-wider text-sm'>
                                            Decline
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}}
                    keyExtractor={(item) => item.uid}
                    ListEmptyComponent={() => {
                        if (tab === "My friends") {
                            return (
                                <View className="flex-1 justify-center items-center"> 
                                    <Text className="text-center text-base font-medium italic text-gray-500">
                                        {"No friends found"}
                                    </Text>
                                </View>
                            )
                        } else {
                            return (
                                <View className="flex-1 justify-center items-center"> 
                                    <Text className="text-center text-base font-medium italic text-gray-500">
                                        {"No friend requests found"}
                                    </Text>
                                </View>
                            )
                        }
                    }}
                    contentContainerStyle={{flexGrow: 1, paddingHorizontal: 20, paddingTop: 0, paddingBottom: 15}}
                    ItemSeparatorComponent={() => <Divider />}
                    />
                </View>
            )}
        </View>
        </>
    )
}

export default Friends