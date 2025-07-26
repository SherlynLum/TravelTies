import { View, Text, Pressable, Alert, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/authContext'; 
import { submitRating } from '@/apis/userApi';
 
const RateUs = () => {
    const insets = useSafeAreaInsets();
    const [rating, setRating] = useState<number>(0); // 0 means haven't rated
    const {user, getUserIdToken} = useAuth();

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert("Submit rating", "You haven't rated us yet - tap a star to give a rating from 1 to 5");
            return;
        }
        try {
            const token = await getUserIdToken(user);
            await submitRating({token, rating});
        } catch (e) {
            console.log(e);
            Alert.alert("Submit rating", "Failed to submit rating - please try again later");
        }
    }

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <View className="flex-1 flex-col gap-8 items-center justify-center px-5 pt-3 bg-white" 
        style={{paddingBottom: insets.bottom}}>
            <View className="flex flex-row items-center justify-center gap-5">
                {[1, 2, 3, 4, 5].map((no) => {
                    if (no <= rating) {
                        return (
                            <Pressable key={no} onPress={() => setRating(no)} hitSlop={5}>
                                <FontAwesome name="star" size={40} color="#fbbf24" />
                            </Pressable>
                        )
                    } else {
                        return (
                            <Pressable key={no} onPress={() => setRating(no)} hitSlop={5}>
                                <FontAwesome name="star-o" size={40} color="#fbbf24" />
                            </Pressable>
                        )
                    }
                })}
            </View>
            <Pressable className="flex justify-center items-center" onPress={() => setRating(0)}
            hitSlop={16}>
                <Text className="font-bold text-sm text-gray-500 text-center">
                    Clear
                </Text>
            </Pressable>
            <TouchableOpacity onPress={handleSubmit}
            className='bg-blue-500 justify-center items-center border 
            border-blue-600 shadow-sm h-[44px] px-8 rounded-[30px]'>
                <Text className='text-white font-semibold tracking-wider text-sm'>
                    Submit
                </Text>
            </TouchableOpacity>
        </View>
        </>
    )
}

export default RateUs