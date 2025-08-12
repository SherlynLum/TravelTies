import { View, Text, Dimensions, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router';
import { Card } from 'react-native-paper';
import { NoteCardPreview } from '@/types/cards';
import Entypo from '@expo/vector-icons/Entypo';
import { useAuth } from '@/context/authContext';
import { deleteCard } from '@/apis/cardApi';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Loading from './Loading';

const NoteCard = ({tab, tripId, _id, title, startDate, startTime, endDate, endTime, description, 
    removeFromTab} : NoteCardPreview) => {
    const {user, getUserIdToken} = useAuth();
    const [loading, setLoading] = useState(false);
    const [timeStr, setTimeStr] = useState("");
    // for cases when initially it is under a day tab and later on shorten the trip duration 
    // so that day tab is removed and this card goes to the unscheduled tab
    const [dateOutOfBound, setDateOutOfBound] = useState(false); 
    
    useEffect(() => {
        const hasStart = !!(startDate || startTime); 
        const hasEnd = !!(endDate || endTime);

        if (startDate || endDate) { // when either startDate or endDate exist 
            if (tab === "unscheduled") { // this tab still under unscheduled
                setDateOutOfBound(true); // means this card is definitely out of bound 
            } else {
                setDateOutOfBound(false);
            }
        }

        if (tab === "unscheduled") { // unscheduled tab have startDate or endDate means it is out of bound and date(s) will be displayed
            if (hasStart && !hasEnd) {
                setTimeStr("Starts from " + (startDate ? `Day ${startDate} ` : "")
                    + (startTime ? `at ${startTime}` : ""));
            } else if (hasEnd && !hasStart) {
                setTimeStr("Ends " + (endDate ? `on Day ${endDate} `: "")
                    + (endTime ? `at ${endTime}`: ""));
            } else if (hasStart && hasEnd) {
                setTimeStr((startDate ? `Day ${startDate} ` : "") + (startTime ? `${startTime} ` : "") 
                    + "- " + (endDate ? `Day ${endDate} ` : "") + (endTime ? `${endTime} ` : "")
                )
            } else {
                setTimeStr("");
            }
        } else if (startDate && endDate && startDate !== endDate) { // if the card spans for a few days and is not under unscheduled tab, date(s) will be displayed
            setTimeStr((startDate ? `Day ${startDate} ` : "") + (startTime ? `${startTime} ` : "")
                + "- " + (endDate ? `Day ${endDate} ` : "") + (endTime ? `${endTime} ` : "")
            )
        } else { // all other cases display time only
            setTimeStr((startTime && endTime) ? `${startTime} - ${endTime}` : startTime 
                ? `Starts at ${startTime}` : endTime ? `Ends at ${endTime}` : "");
        }
    }, []);

    const screenWidth = Dimensions.get("window").width;
    const coverWidth = screenWidth - 18 - 18; // 18 horixontal padding on each side
    const coverHeight = 40;

    const deleteThisCard = async () => {
        setLoading(true);
        try {
            const token = await getUserIdToken(user);
            await deleteCard(token, _id);
            removeFromTab(_id);
        } catch (e) {
            console.log(e);
            Alert.alert("Delete itinerary card", `Failed to delete card: ${title}`);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = () => {
        Alert.alert("Delete itinerary card", `Are you sure you want to delete ${title}?`,
            [
                {
                    text: "No",
                    style: "cancel"
                }, 
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: deleteThisCard
                }
            ]
        )
    }

  return (
    <Link href={`/trips/${tripId}/${_id}/cardDetails`} asChild>
        <TouchableOpacity className="rounded-xl items-center">
            <View className="pb-5" style={{paddingHorizontal: 18}}>
                <Card style={{padding: 0, borderRadius: 16, width: coverWidth}}>
                    <View className="flex flex-col gap-4">
                        {/* cover */}
                        <View className="w-full rounded-t-xl bg-amber-500 flex items-end justify-center px-3"
                        style={{width: coverWidth, height: coverHeight}}>
                            {loading ? (
                                <Loading size={hp(5)}/>
                            ) : (
                                <TouchableOpacity hitSlop={10} 
                                onPress={(e) => {
                                    e.stopPropagation(); // no navigation to the card details page when pressing delete button
                                    handleDelete();
                                }}>
                                    <Entypo name="circle-with-cross" size={24} color="white"/>
                                </TouchableOpacity>
                            )}
                        </View>
                        {/* card content */}
                        <View className="flex flex-col gap-2.5 px-3 justify-center items-start"
                        style={{paddingBottom: 15}}>
                            {/* card title */}
                            <Text className="font-semibold text-lg text-left" numberOfLines={1}
                            ellipsizeMode="tail">
                                {title}
                            </Text>

                            {/* card time */}
                            {(timeStr) && (
                                <Text className={`font-medium text-sm text-left ${dateOutOfBound ? "text-red-500"
                                    : "text-black"}`}>
                                    {timeStr}
                                </Text>
                            )}

                            {/* description */}
                            {(description) && (
                                <Text className="font-medium text-sm text-left" numberOfLines={5} 
                                ellipsizeMode="tail">
                                    {description}
                                </Text>
                            )}       
                        </View>
                    </View>
                </Card>
            </View>
        </TouchableOpacity>
    </Link>
  )
}

export default NoteCard