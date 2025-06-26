import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { Trip } from '@/types/trips';
import Octicons from '@expo/vector-icons/Octicons';
import { Link } from 'expo-router';
import { Card } from 'react-native-paper';

const ActiveTripCard = ({_id, name, profilePicKey, startDate, endDate, noOfDays, noOfNights, 
    noOfParticipants, profilePicUrl} : Trip) => {
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

  return (
    <Link href={`/trips/${_id}`} asChild>
        <TouchableOpacity className="rounded-xl items-center">
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
                <View className="flex flex-col gap-2.5 px-3 justify-center items-start"
                style={{paddingBottom: 15}}>
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
                                {noOfDays} Days {noOfNights} Nights
                            </Text>
                        </View>
                    ) : null}

                    {/* number of participants */}
                    <View className="flex flex-row gap-1 justify-start items-center">
                        <Octicons name="person" size={20} color="gray" />     
                        <Text className="font-medium text-sm text-left">
                            {noOfParticipants} buddies 
                        </Text>
                    </View>
                </View>
                </View>
            </Card>
            </View>
        </TouchableOpacity>
    </Link>
  )
}

export default ActiveTripCard