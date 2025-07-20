import { Alert, ScrollView, Text, View, Dimensions, ImageBackground, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Trip } from '@/types/trips';
import { useAuth } from '@/context/authContext';
import { getTripOverview } from '@/apis/tripApi';
import { getDisplayUrl } from '@/apis/awsApi';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { toDisplayDate, toDisplayDay } from '@/utils/dateTimeConverter';
import Octicons from '@expo/vector-icons/Octicons';

const CardDetails = () => {
    const insets = useSafeAreaInsets();
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const {user, getUserIdToken} = useAuth();
    const screenWidth = Dimensions.get("window").width;
    const imageHeight = screenWidth / 3;

    /* for testing: 
    const [trip, setTrip] = useState<Trip | null>({_id: "efg", name: "Korea trip", startDate: "2025-09-18", endDate: "2025-09-23", 
      noOfDays: 6, noOfNights: 5, noOfParticipants: 1});
    */
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasDates, setHasDates] = useState(false);
    const [startDateStr, setStartDateStr] = useState({date: "", day: ""});
    const [endDateStr, setEndDateStr] = useState({date: "", day: ""});
    const [hasDuration, setHasDuration] = useState(false);
    const [dayStr, setDayStr] = useState("Days");
    const [nightStr, setNightStr] = useState("Nights");
    const [buddyStr, setBuddyStr] = useState("Buddies");

    const getProfilePicUrl = async (token: string, key: string) => {
        try {
        const url = await getDisplayUrl(token, key);
            return url;
        } catch (e) {
            console.log(e);
            return "Failed to load";
        }
    }

    const formatDate = (date: string) => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    } 

    /* for testing 
    useEffect(() => {
        if (trip?.startDate && trip?.endDate) {
            setHasDates(true);

            const tripStartDate = new Date(trip.startDate);
            setStartDateStr({date: toDisplayDate(tripStartDate), day: toDisplayDay(tripStartDate)});

            const tripEndDate = new Date(trip.endDate);
            setEndDateStr({date: toDisplayDate(tripEndDate), day: toDisplayDay(tripEndDate)});
        }

        if (trip?.noOfDays && trip?.noOfNights) {
            setHasDuration(true);
            if (trip.noOfDays <= 1) {
                setDayStr("Day");
            }
            if (trip.noOfNights <= 1) {
                setNightStr("Night");
            }
        }

        if (trip?.noOfParticipants && trip.noOfParticipants <= 1) {
            setBuddyStr("Buddy");
        }
    }, [])
    */

    /* */
    useEffect(() => {
        setLoading(true);

        const getTrip = async () => {
            try {
                const token = await getUserIdToken(user);
                const currentTrip = await getTripOverview({token, id});

                if (!currentTrip) {
                    throw new Error("No trip is found");
                }

                if (currentTrip.profilePicKey) {
                    const profilePicUrl = await getProfilePicUrl(token, currentTrip.profilePicKey);
                    currentTrip.profilePicUrl = profilePicUrl;
                }

                if (currentTrip.startDate && currentTrip.endDate) {
                    setHasDates(true);

                    const tripStartDate = new Date(currentTrip.startDate);
                    setStartDateStr({date: toDisplayDate(tripStartDate), day: toDisplayDay(tripStartDate)});

                    const tripEndDate = new Date(currentTrip.endDate);
                    setEndDateStr({date: toDisplayDate(tripEndDate), day: toDisplayDay(tripEndDate)});
                }

                if (currentTrip.noOfDays && currentTrip.noOfNights) {
                    setHasDuration(true);
                    if (currentTrip.noOfDays <= 1) {
                        setDayStr("Day");
                    }
                    if (currentTrip.noOfNights <= 1) {
                        setNightStr("Night");
                    }
                }

                if (currentTrip.noOfParticipants <= 1) {
                    setBuddyStr("Buddy");
                }

                setTrip(currentTrip);
            } catch (e) {
                console.log(e)
                Alert.alert("View trip", 
                    "Cannot load this trip",
                    [{
                        text: "Back to trips dashboard",
                        onPress: () => router.back()
                    }])
            } finally {
                setLoading(false);
            }
        };
        getTrip();
    }, [])
    /**/

  return (
    loading ? (
        <View className="flex-1 justify-center items-center">
            <Loading size={hp(12)} />
        </View>
    ) : trip && (
        <View className = "flex-1">
            <ScrollView className="flex-1 px-5 pt-5 bg-white" 
                contentContainerStyle={{paddingBottom: insets.bottom}}>
                <View className="flex-1 flex-col gap-10">
                    <View className="flex flex-col gap-3">
                        {/* trip name */}
                        <Text className="font-semibold text-2xl text-left">
                            {trip.name}
                        </Text>

                        {/* dates */}
                        {hasDates && (
                            <View className="flex flex-row gap-1 justify-start items-center">
                                <Text className="font-semibold text-base text-left text-gray-500">
                                    Dates:
                                </Text>
                                <Text className="font-medium text-base text-left">
                                    {`${startDateStr.date} (${startDateStr.day}) - ${endDateStr.date} (${endDateStr.day})`}
                                </Text>
                            </View>
                        )}

                        {/* duration */}
                        {hasDuration && (
                            <View className="flex flex-row gap-1 justify-start items-center">
                                <Text className="font-semibold text-base text-left text-gray-500">
                                    Duration:
                                </Text>
                                <Text className="font-medium text-base text-left">
                                    {`${trip.noOfDays} ${dayStr} ${trip.noOfNights} ${nightStr}`}
                                </Text>
                            </View> 
                        )}

                        {/* number of participants */}
                        <View className="flex flex-row gap-3 justify-start items-center">
                            <Octicons name="person" size={20} color="gray" />     
                            <Text className="font-medium text-base text-left">
                                {`${trip.noOfParticipants} ${buddyStr}`}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-1 flex-row justify-between items-center shadow-sm px-5">
                        <Link href={`./itinerary`} asChild>
                            <TouchableOpacity className="rounded-[10px] h-[100px] items-center justify-center" 
                            style={{backgroundColor: "#CCE4F6", width: wp(37)}}>
                                <Text className="text-lg font-semibold">
                                    Itinerary
                                </Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href={`./polls`} asChild>
                            <TouchableOpacity className="rounded-[10px] h-[100px] items-center justify-center" 
                            style={{backgroundColor: "#CDE5DC", width: wp(37)}}>
                                <Text className="text-lg font-semibold">
                                    Polls
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <View className="flex-1 flex-row justify-between items-center shadow-sm px-5">
                        <Link href={`./checklists`} asChild>
                            <TouchableOpacity className="rounded-[10px] h-[100px] items-center justify-center" 
                            style={{backgroundColor: "#C9EBCB", width: wp(37)}}>
                                <Text className="text-lg font-semibold">
                                    Checklists
                                </Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href={`./expenseTracker`} asChild>
                            <TouchableOpacity className="rounded-[10px] h-[100px] items-center justify-center" 
                            style={{backgroundColor: "#FFE6B3", width: wp(37)}}>
                                <Text className="text-lg font-semibold">
                                    Expense tracker
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <View className="flex-1 flex-row justify-between items-center shadow-sm px-5">
                        <Link href={`./gallery`} asChild>
                            <TouchableOpacity className="rounded-[10px] h-[100px] items-center justify-center" 
                            style={{backgroundColor: "#FCD8C4", width: wp(37)}}>
                                <Text className="text-lg font-semibold">
                                    Gallery
                                </Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href={`./recommendations`} asChild>
                            <TouchableOpacity className="rounded-[10px] h-[100px] items-center justify-center" 
                            style={{backgroundColor: "#F4C7D9", width: wp(37)}}>
                                <Text className="text-lg font-semibold">
                                    Recommendations
                                </Text>
                            </TouchableOpacity>
                        </Link>
                </View>
                </View>
            </ScrollView>

            {/* trip profile picture */}
            <ImageBackground
                source={
                    !trip.profilePicUrl ? require("../../../../assets/images/default-trip-profile-pic.png") 
                    : trip.profilePicUrl === "Failed to load" 
                    ? {uri: `https://placehold.co/${screenWidth}x${imageHeight}?text=Failed+to+load`}
                    : {uri: trip.profilePicUrl}
                }
                className="absolute bottom-0 left-0"
                style={{width: screenWidth, height: imageHeight}}
                resizeMode="cover"
            />
        </View>
  ))
}

export default CardDetails
