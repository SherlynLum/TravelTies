import { View, Text, TextInput, Alert, Image, Dimensions, TouchableOpacity, Platform, KeyboardAvoidingView, FlatList, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/context/authContext';
import { pickOnePic } from '@/utils/imagePicker';
import { createTrip, getUploadUrl } from '@/apis/tripApi';
import { deleteObj, uploadPic, getDisplayUrl } from '@/apis/awsApi';
import { isAxiosError } from 'axios';
import { Divider, Menu } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { toDisplayDate, toDisplayDay, toFloatingDate } from '@/utils/dateTimeConverter';
import { getProfile } from "@/apis/userApi";
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { TripParticipant, TripParticipantWithProfile } from '@/types/trips';
import AdjustTripPicModal from '@/components/AdjustTripPicModal';
import ManageBuddiesModal from '@/components/ManageBuddiesModal';

const AddTrip = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {user, getUserIdToken} = useAuth();
    const nameRef = useRef("");
    const ios = Platform.OS === 'ios';

    const [picUri, setPicUri] = useState("");
    const [picWidth, setPicWidth] = useState(0);
    const [picHeight, setPicHeight] = useState(0);
    const [croppedPicUri, setCroppedPicUri] = useState("");
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [oldPicKey, setOldPicKey] = useState("");
    const [picKey, setPicKey] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [startDateStr, setStartDateStr] = useState({date: "", day: ""});
    const [startPickerOpen, setStartPickerOpen] = useState(false);
    const [isPickingStartDate, setIsPickingStartDate] = useState(false);

    const [endDate, setEndDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [endDateStr, setEndDateStr] = useState({date: "", day: ""});
    const [endPickerOpen, setEndPickerOpen] = useState(false);
    const [isPickingEndDate, setIsPickingEndDate] = useState(false);

    const [noOfDays, setNoOfDays] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [noOfNights, setNoOfNights] = useState<number | null>(null);
    const [dayStr, setDayStr] = useState("Days");
    const [nightStr, setNightStr] = useState("Nights");

    const [userProfilePicUrl, setUserProfilePicUrl] = useState("");
    const [buddies, setBuddies] = useState<TripParticipantWithProfile[]>([]);
    const [currentUid, setCurrentUid] = useState("");
    const [tripParticipants, setTripParticipants] = useState<TripParticipant[]>([]);
    const [manageModalOpen, setManageModalOpen] = useState(false);

    const screenWidth = Dimensions.get("window").width;
    const imageWidth = screenWidth - 18 - 18; // 18 horixontal padding on each side
    const imageHeight = imageWidth / 3;

    const getProfilePicUrl = async (token: string, key: string) => {
        try {
            const url = await getDisplayUrl(token, key);
            return url;
        } catch (e) {
            console.log(e);
            return "Failed to load";
        }
    }

    // get current user's info when first render this page
    useEffect(() => {
        setLoading(true);

        const getUserProfile = async () => {
            try {
                const token = await getUserIdToken(user);
                const profile = await getProfile(token);
                if (!profile) {
                    throw new Error("Failed to load profile of current user")
                }
                setCurrentUid(profile.uid);

                let url; 
                if (profile.profilePicKey) {
                    url = await getProfilePicUrl(token, profile.profilePicKey);
                    setUserProfilePicUrl(url);
                }

                const creatorWithProfile = {
                    participantUid: profile.uid,
                    role: "creator",
                    username: profile.username,
                    profilePicKey: profile.profilePicKey || undefined,
                    profilePicUrl: url || undefined
                }
                setBuddies([creatorWithProfile]);
            } catch (e) {
                console.log(e);
                Alert.alert("Create trip", 
                "Unable to create a trip because we couldn’t load your profile.",
                [{
                    text: "Back to trips dashboard",
                    onPress: () => router.replace("/tripsDashboard")
                }])
            } finally {
                setLoading(false);
            }
        };

        getUserProfile();
    }, [])

    // pick profile pic
    const pickProfilePic = async (source: "camera" | "gallery") => {
        setMenuOpen(false);
        try {
            const response = await pickOnePic(source);
            if (response.success) {
                setPicUri(response.uri);
                setCroppedPicUri(""); // reset croppedPicUri since the selected picture is changed
                setUploadSuccess(false); // similarly, reset uploadSuccess
                Image.getSize(response.uri, (width, height) => {
                    setPicWidth(width);
                    setPicHeight(height);
                    setAdjustModalOpen(true);
                });
            } else if (response.message) {
                Alert.alert("Pick profile picture", response.message);
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Pick profile picture", "Failed to select profile picture - please try again");
        }
    }

    const closeAdjustModal = () => {
        setAdjustModalOpen(false);
    }

    const completeAdjustPic = (croppedUri: string) => {
        setAdjustModalOpen(false);
        setCroppedPicUri(croppedUri);
    }

    const uploadCroppedPic = async (token: string) => {
        try {
            // get presigned url 
            const urlRes = await getUploadUrl(token);
            const {key, url} = urlRes;
            if (!key || !url) {
                throw new Error("Failed to retrieve upload link for AWS S3");
            }

            // convert cropped pic uri into binary format to upload
            if (!croppedPicUri) {
                throw new Error("No profile picture was found");
            }
            const resource = await fetch(croppedPicUri);
            const blob = await resource.blob();

            // upload to presigned uri
            await uploadPic(url, blob);

            setUploadSuccess(true);
            if (picKey) { // if there is a previous pic key, store the previous pic key into oldPicKey
                setOldPicKey(picKey);
            }
            setPicKey(key);
            return {key}; // for checking this time upload success or not 
        } catch (e) {
            if (isAxiosError(e)) { // deal with axios request errors 
                // if error comes from get presigned url, there will be a message field in res
                console.log(e.response?.data?.message ||  "Failed to get presigned url");
            } else { // deal with error in fetch and blob
                console.log(e);
            }
            Alert.alert("Add trip", "Failed to upload trip profile picture");
            return; // for checking this time upload success or not 
        }
    }

    const deletePrevPic = async (token: string) => {
        try {
            await deleteObj(token, oldPicKey);
            setOldPicKey("");
        } catch (e) { // when fail to delete picture from AWS S3, it is okay to let user proceed as it is not a critical issue just will cause additional storage
            console.log("Failed to delete picture with key ", oldPicKey, " from AWS S3");
        }
    }

    const openStartDatePicker = () => {
        setIsPickingStartDate(true);
        if (!ios) {
            DateTimePickerAndroid.open({
                value: startDate ? startDate : (endDate ? endDate : new Date()),
                mode: "date",
                minimumDate: new Date(),
                onChange: (event, date) => {
                    setIsPickingStartDate(false);
                    if (event.type === "set" && date) {
                        setStartDate(date);
                    }
                }
            })
        } else {
            setStartPickerOpen(true);
            setIsPickingStartDate(true);
        }
    }

    const openEndDatePicker = () => {
        if (!ios) {
            setIsPickingEndDate(true);
            DateTimePickerAndroid.open({
                value: endDate ? endDate : (startDate ? startDate : new Date()),
                mode: "date",
                minimumDate: new Date(),
                onChange: (event, date) => {
                    setIsPickingEndDate(false)
                    if (event.type === "set" && date) {
                        setEndDate(date);
                    }
                }
            })
        } else {
            setEndPickerOpen(true);
            setIsPickingEndDate(true);
        }
    }

    useEffect(() => {
        if (startDate && noOfDays && !endDate && !isPickingEndDate) {
            const daysInMs = Number(noOfDays) * 24 * 60 * 60 * 1000;
            const end = new Date(startDate.getTime() + daysInMs);
            setEndDate(end);
            setEndDateStr({date: toDisplayDate(end), day: toDisplayDay(end)});
            return;
        } else if (endDate && noOfDays && !startDate && !isPickingStartDate) {
            const daysInMs = Number(noOfDays) * 24 * 60 * 60 * 1000;
            const start = new Date(endDate.getTime() - daysInMs);
            setStartDate(start);
            setStartDateStr({date: toDisplayDate(start), day: toDisplayDay(start)});
            return;
        } else if (startDate && endDate && !noOfDays && !isTyping) {
            const diffInMs = endDate.getTime() - startDate.getTime();
            const days = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;
            const nights = days - 1;
            setNoOfDays(days.toString());
            setNoOfNights(nights);
            return;
        }

        if (startDate) {
            setStartDateStr({date: toDisplayDate(startDate), day: toDisplayDay(startDate)});
        } else {
            setStartDateStr({date: "", day:""})
        }

        if (endDate) {
            setEndDateStr({date: toDisplayDate(endDate), day: toDisplayDay(endDate)});
        } else {
            setEndDateStr({date: "", day: ""});
        }

        if (noOfDays) {
            const days = Number(noOfDays)
            const nights = days - 1;
            setNoOfNights(nights)
            if (days <= 1) {
                setDayStr("Day");
            }
            if (nights <= 1) {
                setNightStr("Night");
            }
        } else {
            setNoOfNights(null);
        }
    }, [startDate, endDate, noOfDays]);

    const closeManageModal = () => {
        setManageModalOpen(false);
    }

    const completeManageModal = (updatedbuddies: TripParticipantWithProfile[]) => {
        setBuddies(updatedbuddies);
        setManageModalOpen(false);
    }

    useEffect(() => {
        const participants = buddies.map(({participantUid, role}) => ({participantUid, role}))
        setTripParticipants(participants)
    }, [buddies])

    const createATrip = async () => {
        try {
            const token = await getUserIdToken(user);

            let key = picKey;

            if (croppedPicUri) {
                if (!uploadSuccess) {
                    const uploadRes = await uploadCroppedPic(token);
                    key = uploadRes?.key;
                    if (!key) {
                        throw new Error("Failed to upload trip profile picture");
                    }
                }
            }

            if (oldPicKey) {
                await deletePrevPic(token); // no early exit as delete previous pictrue from aws s3 is not really a must
            } 

            const trip = await createTrip({token, name: nameRef.current, 
                profilePicKey: key || undefined, 
                startDate: startDate ? toFloatingDate(startDate) : undefined,
                endDate: endDate ? toFloatingDate(endDate) : undefined,
                noOfDays: noOfDays ? Number(noOfDays) : undefined,
                noOfNights: noOfNights || undefined,
                tripParticipants});
            if (!trip) {
                throw new Error("No trip is created");
            }
            router.replace("/tripsDashboard");
        } catch (e) {
            console.log(e);
            if (isAxiosError(e) && e.response?.data?.datesErr) {
                Alert.alert("Failed to create trip", e.response.data.message);
                return;
            }
            Alert.alert("Failed to create trip", "Please try again later");
        } finally {
            setCreateLoading(false);
        }
    }

    const handleCreate = async () => {
        if (!nameRef.current) {
            Alert.alert("Failed to create trip", "Please give your trip a name");
            return;
        }
        if ((startDate && !endDate) || (!startDate && endDate)) {
            Alert.alert("Failed to create trip", 
                "Start date and end date must be set together or left unset");
            return;
        }

        if (startDate && endDate && (startDate > endDate)) {
            Alert.alert("Failed to create trip", "Start Date must be before end date");
            return;
        }

        if (startDate && endDate && noOfDays) {
            const diffInMs = endDate.getTime() - startDate.getTime();
            const days = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;
            if (Number(noOfDays) !== days) {
                Alert.alert("Failed to create trip", 
                "The number of days does not match the selected start and end dates");
                return;
            }
        }

        if (noOfDays && Number(noOfDays) <= 0) {
            Alert.alert("Failed to create trip", "The number of days must be at least 1");
            return;
        }

        setCreateLoading(true);
        await createATrip();
    }

  return (
    loading ? (
        <View className="flex-1 justify-center items-center">
            <Loading size={hp(12)} />
        </View>
    ) : (
    <KeyboardAvoidingView behavior={ios? 'padding': 'height'} style={{flex: 1}}>
    <ScrollView className="flex-1 px-5 pt-3 bg-white" 
    contentContainerStyle={{paddingBottom: insets.bottom}}
    keyboardShouldPersistTaps="handled">
        <View className="flex flex-col gap-5">
            {/* trip name input */}
            <View className="flex flex-col gap-3">
                <View className="flex flex-row gap-2">
                    <Text className="font-semibold text-lg text-left">
                        Trip name
                    </Text>
                    <Text className="font-semibold text-lg text-red-500 text-left">
                        *
                    </Text>
                </View>
                <View className="bg-white border border-black px-4 rounded-[5px] h-[50px]">
                    <TextInput
                        autoCapitalize="none"
                        onChangeText={value => nameRef.current=value}
                        className="flex-1 font-medium text-black text-base"
                        placeholder="Name your trip"
                        placeholderTextColor={"gray"}
                        style={{textAlignVertical: "center"}}
                    />
                </View>
            </View>

            {/* select trip profile picture */}
            <View className="flex flex-col gap-3">
                <Text className="font-semibold text-lg text-left">
                    Trip profile picture
                </Text>
                <Image source={croppedPicUri ? ({uri: croppedPicUri}) : 
                    require("../../../assets/images/default-trip-profile-pic.png")}
                    style={{width: imageWidth, height: imageHeight}}
                    className="border-neutral-400 border-1" />
                <View className="items-center">
                    <Menu visible={menuOpen} onDismiss={() => setMenuOpen(false)}
                        anchor={
                            <TouchableOpacity onPress={() => setMenuOpen(true)} 
                            className='bg-blue-400 justify-center items-center border 
                            border-blue-700 shadow-sm h-[44px] px-6 rounded-[30px]'>
                                <Text className='text-white font-semibold tracking-wider text-sm'>
                                    Choose a different picture
                                </Text>
                            </TouchableOpacity>
                        }
                    contentStyle={{borderRadius: 10, backgroundColor: "white", elevation: 3}}>
                        <Menu.Item title="Take photo" onPress={() => pickProfilePic("camera")} />
                        <Divider />
                        <Menu.Item title="Choose from gallery" onPress={() => pickProfilePic("gallery")} />
                    </Menu>
                </View>
            </View>

            {/* select start date */}
            <View className="flex flex-col gap-3">
                <View className="flex flex-row justify-between items-center">
                    <Text className="font-semibold text-lg text-left">
                        Start date
                    </Text>
                    <Text className="font-medium text-xs italic text-neutral-400">
                        Undecided? Just leave it blank for now
                    </Text>
                </View>
                <View className="flex flex-row justify-between items-center gap-5">
                    <TouchableOpacity className="flex-1 flex-row bg-white border border-black px-4 
                    rounded-[5px] h-[50px] items-center gap-3" onPress={openStartDatePicker}>
                        <AntDesign name="calendar" size={24} color="gray" />
                        <Text className={`flex-1 font-medium ${startDateStr.date ? "text-black" : 
                        "text-gray-500"} text-base`}>
                            {startDateStr.date ? `${startDateStr.date} (${startDateStr.day})` 
                            : "Select trip start date"}
                        </Text>
                    </TouchableOpacity>
                    <Pressable hitSlop={14} onPress={() => {
                            setTempStartDate(null);
                            setStartDate(null)
                        }}>
                           <Entypo name="circle-with-cross" size={28} 
                           color={startDate ? "red" : "gray"}/>
                    </Pressable>
                </View>
                {/* ios date picker */}
                { startPickerOpen && (
                    <View className="bg-white rounded-xl p-2 shadow-sm items-center">
                        <DateTimePicker 
                            value = {tempStartDate || new Date()}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(event, date) => {
                                if (date) {
                                    setTempStartDate(date);
                                }
                            }}
                        />
                        <View className="flex flex-row justify-between px-3 w-full">
                            <Pressable hitSlop={14} onPress={() => {
                                setTempStartDate(startDate);
                                setStartPickerOpen(false)
                            }}>
                                <Text className="text-red-500 font-medium text-base">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable hitSlop={14} onPress={() => {
                                setStartDate(tempStartDate || new Date()); // if onChange is not fired then the date picker actually shows the default date which is today, so fallback to today's date
                                setStartPickerOpen(false)
                            }}>
                                <Text className="text-green-700 font-medium text-base">
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>

            {/* select end date */}
            <View className="flex flex-col gap-3">
                <View className="flex flex-row justify-between items-center">
                    <Text className="font-semibold text-lg text-left">
                        End date
                    </Text>
                    <Text className="font-medium text-xs italic text-neutral-400">
                        Undecided? Just leave it blank for now
                    </Text>
                </View>
                <View className="flex flex-row justify-between items-center gap-5">
                    <TouchableOpacity className="flex-1 flex-row bg-white border border-black px-4 
                    rounded-[5px] h-[50px] items-center gap-3" onPress={openEndDatePicker}>
                        <AntDesign name="calendar" size={24} color="gray" />
                        <Text className={`flex-1 font-medium ${endDateStr.date ? "text-black" : 
                        "text-gray-500"} text-base`}>
                            {endDateStr.date ? `${endDateStr.date} (${endDateStr.day})` 
                            : "Select trip end date"}
                        </Text>
                    </TouchableOpacity>
                    <Pressable hitSlop={14} onPress={() => {
                            setTempEndDate(null);
                            setEndDate(null)
                        }}>
                           <Entypo name="circle-with-cross" size={28} 
                           color={endDate ? "red" : "gray"}/>
                    </Pressable>
                </View>
                {/* ios date picker */}
                { endPickerOpen && (
                    <View className="bg-white rounded-xl p-2 shadow-sm items-center">
                        <DateTimePicker 
                            value = {tempEndDate || new Date()}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(event, date) => {
                                if (date) {
                                    setTempEndDate(date);
                                }
                            }}
                        />
                        <View className="flex flex-row justify-between px-3 w-full">
                            <Pressable hitSlop={14} onPress={() => {
                                setTempEndDate(endDate);
                                setEndPickerOpen(false)
                            }}>
                                <Text className="text-red-500 font-medium text-base">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable hitSlop={14} onPress={() => {
                                setEndDate(tempEndDate || new Date());
                                setEndPickerOpen(false);
                            }}>
                                <Text className="text-green-700 font-medium text-base">
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>

            {/* input duration */}
            <View className="flex flex-col gap-3">
                <View className="flex flex-row justify-between items-center">
                    <Text className="font-semibold text-lg text-left">
                        Duration
                    </Text>
                    <Text className="font-medium text-xs italic text-neutral-400">
                        Undecided? Just leave it blank for now
                    </Text>
                </View>
                <View className="flex flex-row gap-4 items-center">
                    <View className="bg-white border border-black px-4 justify-center rounded-[5px] 
                    w-[60px] h-[50px]">
                        <TextInput
                            value={noOfDays || undefined}
                            keyboardType="numeric"
                            onChangeText={(value) => {
                                setIsTyping(true);
                                setNoOfDays(value);
                            }}
                            className="flex-1 font-medium text-black text-lg"
                            style={{textAlignVertical: "center"}}
                        />
                    </View>
                    <Text className="text-black font-medium text-base">
                        {dayStr}
                    </Text>
                { noOfNights !== null && (
                    <View className="flex flex-row gap-4">
                        <Text className="text-black font-medium text-base">
                            {noOfNights}
                        </Text>
                        <Text className="text-black font-medium text-base">
                            {nightStr}
                        </Text>
                    </View>
                )}
                </View>
            </View>

            {/* manage buddies */}
            <View className="flex flex-col gap-3">
                <Text className="font-semibold text-lg text-left">
                    Buddies
                </Text>
                <View className="flex flex-row gap-4 items-center">
                    {/* current user i.e. the creator */}
                    <View className="flex flex-col gap-2 justify-center items-start">
                        <View className="flex flex-row gap-4 justify-start items-center w-full">
                            <Image source={!userProfilePicUrl 
                            ? require("../../../assets/images/default-user-profile-pic.png")
                            : userProfilePicUrl === "Failed to load" 
                            ? require("../../../assets/images/image-error-icon.png")
                            : {uri: userProfilePicUrl}}
                            className="border-neutral-400 border-2 w-[40px] h-[40px] rounded-[20px]" />

                            {/* buddies */}
                            <FlatList
                            data={buddies.filter(buddy => buddy.participantUid !== currentUid)}
                            renderItem={({item}) => (
                                <Image source={!item.profilePicUrl 
                                ? require("../../../assets/images/default-user-profile-pic.png")
                                : item.profilePicUrl === "Failed to load" 
                                ? require("../../../assets/images/image-error-icon.png")
                                : {uri: item.profilePicUrl}}
                                className="border-neutral-400 border-2 w-[40px] h-[40px] rounded-[20px]" />
                            )}
                            horizontal={true}
                            keyExtractor={(item) => item.participantUid}
                            contentContainerStyle={{justifyContent: "center", alignItems: "center"}}
                            style={{flexGrow: 0, flexShrink: 1}}
                            ItemSeparatorComponent={() => <View className="w-[16px]"/>}
                            />

                            {/* edit button */}
                            <Pressable onPress={() => setManageModalOpen(true)} hitSlop={14}>
                                <FontAwesome6 name="edit" size={20} color="#60A5FA" />
                            </Pressable>
                        </View>
                        <View className="px-3">
                            <Text className="text-xs text-gray-500 font-semibold">
                                You
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* create button */}
            <View className="items-center justify-center">
                {
                    createLoading ? (
                        <Loading size={hp(8)} />
                    ) : (
                        <TouchableOpacity onPress={handleCreate}
                        className='bg-blue-500 justify-center items-center border 
                        border-blue-600 shadow-sm h-[44px] px-8 rounded-[30px]'>
                            <Text className='text-white font-semibold tracking-wider text-sm'>
                                Create
                            </Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>

        {picUri && picWidth > 0 && picHeight > 0 && (
            <AdjustTripPicModal isVisible={adjustModalOpen} picUri={picUri} width={picWidth}
            height={picHeight} closeModal={closeAdjustModal} completeCrop={completeAdjustPic} />
        )}

        <ManageBuddiesModal isVisible={manageModalOpen} buddies={buddies} currentUid={currentUid}
            closeModal={closeManageModal} complete={completeManageModal}/>
    </ScrollView>
    </KeyboardAvoidingView>
  ))
}

export default AddTrip
