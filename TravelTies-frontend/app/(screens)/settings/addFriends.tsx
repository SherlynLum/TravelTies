import { View, Text, FlatList, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { User } from '@/types/users';
import { useAuth } from '@/context/authContext';
import { addFriend, searchUsers } from '@/apis/userApi';
import { FontAwesome } from '@expo/vector-icons';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Divider } from 'react-native-paper';
import { isAxiosError } from 'axios';

const AddFriends = () => {
    const insets = useSafeAreaInsets();
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [otherUsers, setOtherUsers] = useState<User[]>([]);
    const {user, getUserIdToken} = useAuth();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            try{
                const token = await getUserIdToken(user);
                const cleanedSearchTerm = searchTerm.trim();
                if (cleanedSearchTerm) {
                    setLoading(true);
                    const results = await searchUsers(token, cleanedSearchTerm);
                    setOtherUsers(results);
                } else {
                    setLoading(false);
                    setOtherUsers([]);
                }
                setHasError(false);
            } catch (e) {
                console.log(e);
                if (isAxiosError(e)) {
                    console.log("Message:", e.message);
                    console.log("Status:", e.response?.status);
                    console.log("Data:", e.response?.data);
                    console.log("Headers:", e.response?.headers);
                }
                setHasError(true);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchTerm])

    const handleAdd = async (sendRequestToUid: string, sendRequestToUsername: string) => {
        try {
            const token = await getUserIdToken(user);
            await addFriend({token, sendRequestToUid});
            setOtherUsers(prev => prev.filter(user => user.uid !== sendRequestToUid));
        } catch (e) {
            console.log(e);
            Alert.alert("Add user", `Unable to send friend request to ${sendRequestToUsername} - please try again later`);
        }
    }

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <View className="flex-1 flex-col gap-4 bg-white" style={{paddingBottom: insets.bottom}}>
            {/* search bar */}
            <View className="py-5 items-center justify-start px-5 pt-6 bg-white">
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
                    {"An error occurred when searching users.\nPlease try again later."}
                    </Text>
                </View>
            ) : (
                <View className="flex-1 bg-white items-center justify-center">
                    <FlatList
                    data={otherUsers}
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
                            <TouchableOpacity onPress={() => handleAdd(item.uid, item.username)} hitSlop={10}
                            className='bg-blue-500 justify-center items-center border 
                            border-blue-600 shadow-sm h-[30px] px-4 rounded-[30px]'>
                                <Text className='text-white font-semibold tracking-wider text-sm'>
                                    Add 
                                </Text>
                            </TouchableOpacity>
                        </View> 
                    )}}
                    keyExtractor={(item) => item.uid}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center"> 
                            <Text className="text-center text-base font-medium italic text-gray-500">
                                {searchTerm ? "No users found" : "Please enter a search term"}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20}}
                    ItemSeparatorComponent={() => <Divider />}
                    />
                </View>
            )}
        </View>
        </>
    )
}

export default AddFriends