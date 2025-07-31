import { View, Text, Image, Dimensions, TouchableOpacity, Modal, SafeAreaView, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { Trip } from '@/types/trips';
import Octicons from '@expo/vector-icons/Octicons';
import { Card } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Loading from './Loading';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/authContext';
import { joinTrip } from '@/apis/tripApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type JoinTripModalProps = {
    trip: Trip,
    isVisible: boolean,
    closeModal: () => void
}
const JoinTripModal = ({trip, isVisible, closeModal} : JoinTripModalProps) => {
    const insets = useSafeAreaInsets();
    const {user, getUserIdToken} = useAuth();
    const {_id, name, startDate, endDate, noOfDays, noOfNights, noOfParticipants, profilePicUrl} = trip
    const screenWidth = Dimensions.get("window").width;
    const imageWidth = screenWidth - 18 - 18; // 18 horixontal padding on each side
    const imageHeight = imageWidth / 3;

    const hasDates = !!(startDate && endDate); // backend ensures that startDate and endDate exist together
    const hasDuration = !!(noOfDays && noOfNights); // backend ensures that noOfDays and noOfNights exist together

    const formatDate = (date: string) => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    } 
    let formattedStartDate, formattedEndDate;
    if (startDate) {
        formattedStartDate = formatDate(startDate);
    }
    if (endDate) {
        formattedEndDate = formatDate(endDate);
    }

    const dayStr = noOfDays ? ((noOfDays <= 1) ? "Day" : "Days") : undefined;
    const nightStr = noOfNights ? ((noOfNights <= 1) ? "Night" : "Nights") : undefined;
    const buddyStr = (noOfParticipants <= 1) ? "Buddy" : "Buddies";

    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        setLoading(true);
        try {
            const token = await getUserIdToken(user);
            await joinTrip({token, id: _id});
            closeModal();
        } catch (e) {
            console.log(e);
            Alert.alert("Join a trip", "Unable to join this trip - please try again later");
        }
    }

  return (
    <Modal visible={isVisible} animationType="slide">
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <View className="flex-1 bg-white" style={{paddingTop: insets.top, 
            paddingBottom: insets.bottom, paddingLeft: insets.left, 
            paddingRight: insets.right}}>
            {/* header */}
            <View style={{paddingHorizontal: wp(3), height: 56, width: "100%"}}
            className="flex-row items-center justify-center">
                <Pressable onPress={closeModal} hitSlop={10}
                style={{position: "absolute", left: wp(3)}}>
                    <Ionicons name="chevron-back-outline" size={24} color="black" />
                </Pressable>
            </View>
            <View className="flex-1 items-center justify-center">
                <Card style={{padding: 0, borderRadius: 16, width: imageWidth}}>
                    <View className="flex flex-col gap-4">
                        {/* profile pic */}
                        <Image 
                            source={
                                !profilePicUrl ? require("../assets/images/default-trip-profile-pic.png") 
                                    : profilePicUrl === "Failed to load" 
                                        ? {uri: `https://placehold.co/${imageWidth}x${imageHeight}?text=Failed+to+load`}
                                        : {uri: profilePicUrl}
                            }
                            className="w-full rounded-t-xl"
                            style={{width: imageWidth, height: imageHeight}}
                            resizeMode="cover"
                        />

                        {/* card content */}
                        <View className="flex flex-col gap-2.5 px-3 justify-center items-start">
                            {/* trip name */}
                            <Text className="font-semibold text-lg text-left">
                                {name}
                            </Text>

                            {/* duration */}
                            {(hasDates && hasDuration) ? (
                                <View className="flex flex-row gap-1 justify-start items-center">
                                    <Text className="font-semibold text-sm text-left text-gray-500">
                                    Duration
                                    </Text>
                                    <Text className="font-medium text-sm text-left">
                                        {formattedStartDate} - {formattedEndDate}
                                    </Text>
                                    <Text className="font-medium text-sm text-left">
                                        ({noOfDays} Days {noOfNights} Nights)
                                    </Text>
                                </View>
                            ) : hasDuration ? ( // if hasDates, will definitely hasDuration
                                <View className="flex flex-row gap-1 justify-start items-center">
                                    <Text className="font-semibold text-sm text-left text-gray-500">
                                    Duration
                                    </Text>
                                    <Text className="font-medium text-sm text-left">
                                        {`${noOfDays} ${dayStr} ${noOfNights} ${nightStr}`}
                                    </Text>
                                </View>
                            ) : null}

                            {/* number of participants */}
                            <View className="flex flex-row gap-2 justify-start items-center">
                                <Octicons name="person" size={20} color="gray" />     
                                <Text className="font-medium text-sm text-left">
                                    {`${noOfParticipants} ${buddyStr}`}
                                </Text>
                            </View>
                        </View>

                        {loading ? (
                            <View className="justify-center items-center" style={{paddingBottom: 15}}>
                                <Loading size={hp(6)} />
                            </View>
                        ) : 
                        ( <View className="flex px-3 justify-end items-center"
                        style={{paddingBottom: 15}}>
                            {/* join button */}
                            <TouchableOpacity hitSlop={10} onPress={handleJoin}
                            className='bg-blue-500 justify-center items-center border 
                            border-blue-600 shadow-sm h-[30px] px-8 rounded-[30px]'>
                                <Text className='text-white font-semibold tracking-wider text-sm'>
                                    Join
                                </Text>
                            </TouchableOpacity>
                        </View>
                        )}
                    </View>
                </Card>
            </View>
        </View>
    </Modal>
  )
}

export default JoinTripModal