import { View, Text, Image, Dimensions, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { BinTrip } from '@/types/trips';
import Octicons from '@expo/vector-icons/Octicons';
import { Card } from 'react-native-paper';
import { useAuth } from '@/context/authContext';
import { deleteTrip, restoreTrip } from '@/apis/tripApi';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Loading from './Loading';

type BinTripCardProps = {
    trip: BinTrip,
    removeFromBin: (id: string) => void
}
const BinTripCard = ({trip, removeFromBin} : BinTripCardProps) => {
    const {_id, name, startDate, endDate, noOfDays, noOfNights, noOfParticipants, profilePicUrl} = trip
    const {user, getUserIdToken} = useAuth();
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

    const handleRestore = async () => {
        setLoading(true);

        try {
            const token = await getUserIdToken(user);
            const res = await restoreTrip(token, _id);
            if (!res) {
                throw new Error("No trip is found");
            }
            removeFromBin(_id);
        } catch (e) {
            console.log(e);
            Alert.alert("Restore trip", `Failed to restore trip: ${name}`);
        } finally {
            setLoading(false);
        }
    }
 
    const handleDelete = async () => {
        setLoading(true);

        try {
            const token = await getUserIdToken(user);
            await deleteTrip(token, _id);
            removeFromBin(_id);
        } catch (e) {
            console.log(e);
            Alert.alert("Delete trip permanently", `Failed to permanently delete trip: ${name}`);
        } finally {
            setLoading(false);
        }
    }

    const validateDelete = () => {
        Alert.alert("Delete trip permanently", `Are you sure you want to permanently delete trip: ${name}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: handleDelete
                }
            ]
        )
    }

  return (
    <View className="pb-5" style={{paddingHorizontal: 18}}>
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
                ) : // buttons
                ( <View className="flex flex-row gap-2 px-3 justify-end items-center"
                style={{paddingBottom: 15}}>
                    {/* restore button */}
                    <TouchableOpacity hitSlop={10} onPress={handleRestore}
                    className='bg-green-600 justify-center items-center border 
                    border-green-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                        <Text className='text-white font-semibold tracking-wider text-sm'>
                            Restore
                        </Text>
                    </TouchableOpacity>

                    {/* delete button */}
                    <TouchableOpacity hitSlop={10} onPress={validateDelete}
                    className='bg-red-600 justify-center items-center border 
                    border-red-700 shadow-sm h-[30px] px-8 rounded-[30px]'>
                        <Text className='text-white font-semibold tracking-wider text-sm'>
                            Delete permanently 
                        </Text>
                    </TouchableOpacity>
                </View>
                )}
            </View>
        </Card>
    </View>
  )
}

export default BinTripCard