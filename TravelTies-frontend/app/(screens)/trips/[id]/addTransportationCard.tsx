import { View, Text, TextInput, Alert, TouchableOpacity, Platform, KeyboardAvoidingView, Switch } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable, ScrollView } from 'react-native-gesture-handler';
import { useAuth } from '@/context/authContext';
import { getOrderInTab } from '@/apis/tripApi';
import { isAxiosError } from 'axios';
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { toTimeStr } from '@/utils/dateTimeConverter';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createNoteCard } from '@/apis/cardApi';

const AddTransportationCard = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const ios = Platform.OS === 'ios';
    const [title, setTitle] = useState("");
    const [departureAddress, setDepartureAddress] = useState("");
    const [arrivalAddress, setArrivalAddress] = useState("");
    const [description, setDescription] = useState("");
    const [daysLoading, setDaysLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const {user, getUserIdToken} = useAuth();

    const [data, setData] = useState<{label: string, value: number}[]>([]);

    const [startDateToggleOn, setStartDateToggleOn] = useState(false);
    const [startDate, setStartDate] = useState<number | null>(null);

    const [startTimeToggleOn, setStartTimeToggleOn] = useState(false);
    const [tempStartTime, setTempStartTime] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [startTimeStr, setStartTimeStr] = useState("");
    const [startPickerOpen, setStartPickerOpen] = useState(false);

    const [endDateToggleOn, setEndDateToggleOn] = useState(false);
    const [endDate, setEndDate] = useState<number | null>(null);

    const [endTimeToggleOn, setEndTimeToggleOn] = useState(false);
    const [tempEndTime, setTempEndTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [endTimeStr, setEndTimeStr] = useState("");
    const [endPickerOpen, setEndPickerOpen] = useState(false);

    useEffect(() => {
        if (!startDateToggleOn) {
            setStartDate(null);
            return;
        }
        if (!endDateToggleOn) {
            setEndDate(null);
            return;
        }
        const getDays = async () => {
            try {
                setDaysLoading(true);
                const token = await getUserIdToken(user);
                const trip = await getOrderInTab({token, id});
                if (!trip) {
                    throw new Error("No trip is found");
                }
                const days = Object.keys(trip.orderInTab).filter(tab => tab !== "unscheduled")
                    .map(day => ({label: day.charAt(0).toUpperCase() + day.slice(1), 
                    value: Number(day.split(" ")[1])}));
                setData(days);
            } catch (e) {
                setData([]);
                console.log(e);
                Alert.alert("Add note card", "Unable to load this trip’s duration, so start and end dates cannot be set");
                setStartDateToggleOn(false);
                setStartDate(null);
                setEndDateToggleOn(false);
                setEndDate(null);
            } finally {
                setDaysLoading(false);
            }}
        getDays();
    }, [startDateToggleOn, endDateToggleOn]);

    const openStartTimePicker = () => {
        if (!ios) {
            DateTimePickerAndroid.open({
                value: startTime || new Date(),
                mode: "time",
                is24Hour: true,
                onChange: (event, time) => {
                    if (event.type === "set" && time) {
                        setStartTime(time);
                    }
                }
            })
        } else {
            setStartPickerOpen(true);
        }
    }
    
    const openEndTimePicker = () => {
        if (!ios) {
            DateTimePickerAndroid.open({
                value: endTime || new Date(),
                mode: "time",
                is24Hour: true,
                onChange: (event, time) => {
                    if (event.type === "set" && time) {
                        setEndTime(time);
                    }
                }
            })
        } else {
            setEndPickerOpen(true);
        }
    }
    
    {/* align time toggle, time, and time str */}
    useEffect(() => {
        if (!startTimeToggleOn) {
            setStartTime(null);
            setTempStartTime(null);
            setStartTimeStr("");
        }
        if (!endTimeToggleOn) {
            setEndTime(null);
            setTempEndTime(null);
            setEndTimeStr("");
        }
        if (startTimeToggleOn && startTime) {
            setStartTimeStr(toTimeStr(startTime));
        }
        if (endTimeToggleOn && endTime) {
            setEndTimeStr(toTimeStr(endTime));
        }
    }, [startTimeToggleOn, endTimeToggleOn, startTime, endTime])

    const createCard = useCallback(async () => {
        try {
            const token = await getUserIdToken(user);
            const card = await createNoteCard({token, tripId: id, title,
                startDate: startDate || undefined,
                startTime: startTimeStr || undefined,
                endDate: endDate || undefined,
                endTime: endTimeStr || undefined,
                description: description || undefined
            });
            if (!card) {
                throw new Error("No card is created");
            }
            router.replace("./itinerary");
        } catch (e) {
            console.log(e);
            if (isAxiosError(e) && e.response?.data?.timeErr) {
                Alert.alert("Failed to create note card", e.response.data.message);
                return;
            }
            Alert.alert("Failed to create note card", "Please try again later");
        } finally {
            setCreateLoading(false);
        }
    }, [title, startDate, startTimeStr, endDate, endTimeStr, description])
   
    const handleCreate = useCallback(async () => {
        if (!title) {
            Alert.alert("Failed to create note card", "Title cannot be empty");
            return;
        }
        if (startDate && endDate) {
            if (endDate < startDate) {
                Alert.alert("Failed to create note card", "End date must be after start date");
                return;
            }
            if (startDate === endDate && startTimeStr && endTimeStr && endTimeStr < startTimeStr) {
                Alert.alert("Failed to create note card", 
                "End time must be after start time if start date is same as end date");
                return;
            }
        }
        setCreateLoading(true);
        await createCard();
    }, [title, startDate, endDate, startTimeStr, endTimeStr, createCard])
   
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={handleCreate} hitSlop={14} disabled={createLoading}>
                    <Text className="font-semibold text-white text-base">
                        Create
                    </Text>
                </Pressable>
            )
        })
    }, [navigation, handleCreate, createLoading])

  return (
    createLoading ? (
      <View className="flex-1 justify-center items-center">
          <Loading size={hp(12)} />
      </View>
    ) : (
    <KeyboardAvoidingView behavior={ios? 'padding': 'height'} style={{flex: 1}}>
      <ScrollView className="flex-1 px-5 pt-3 bg-white" 
      contentContainerStyle={{paddingBottom: insets.bottom}}
      keyboardShouldPersistTaps="handled">
        <View className="flex flex-col gap-5">
          {/* card title input */}
          <View className="flex flex-col gap-3">
            <View className="flex flex-row gap-2">
              <Text className="font-semibold text-lg text-left">
                Title
              </Text>
              <Text className="font-semibold text-lg text-red-500 text-left">
                *
              </Text>
            </View>
            <View className="bg-white border border-black px-4 rounded-[5px] h-[50px]">
              <TextInput
                value={title}
                autoCapitalize="none"
                onChangeText={setTitle}
                className="flex-1 font-medium text-black text-base"
                placeholder="This trip's destination"
                placeholderTextColor={"gray"}
                style={{textAlignVertical: "center"}}
              />
            </View>
          </View>

          {/* departure address input */}
          <View className="flex flex-col gap-3">
            <Text className="font-semibold text-lg text-left">
                Departure address
            </Text>
            <View className="bg-white border border-black px-4 rounded-[5px] h-[50px]">
              <TextInput
                multiline
                value={departureAddress}
                autoCapitalize="none"
                onChangeText={setDepartureAddress}
                className="flex-1 font-medium text-black text-base"
                style={{textAlignVertical: "center"}}
              />
            </View>
          </View>

          {/* city input */}
          <View className="flex flex-col gap-3">
            <Text className="font-semibold text-lg text-left">
                Arrival address
            </Text>
            <View className="bg-white border border-black px-4 rounded-[5px] h-[50px]">
              <TextInput
                multiline
                value={arrivalAddress}
                autoCapitalize="none"
                onChangeText={setArrivalAddress}
                className="flex-1 font-medium text-black text-base"
                style={{textAlignVertical: "center"}}
              />
            </View>
          </View>

          {/* start date */}
          <View className="flex flex-col gap-3">
            <View className="flex flex-row justify-start items-center gap-5">
              <Text className="font-semibold text-lg text-left">
                  Start date
              </Text>
              <Switch value={startDateToggleOn} onValueChange={() => setStartDateToggleOn(prev => !prev)}/>
            </View>
            {startDateToggleOn && (daysLoading ? (
               <View className="flex justify-center items-center">
                  <Loading size={hp(7)} />
                </View>
              ) : (
              <Dropdown
              style={{height: 50, backgroundColor: "white", paddingHorizontal: 16, borderRadius: 5,
                borderColor: "black", borderWidth: 1}}
              data={data}
              search
              searchPlaceholder="Search..."
              labelField="label"
              valueField="value"
              placeholder="Select start date"
              placeholderStyle={{color: "gray"}}
              selectedTextStyle={{fontWeight: 500, color: "black", fontSize: 16}}
              inputSearchStyle={{fontWeight: 500, color: "black", fontSize: 16}}
              value={startDate}
              onChange={item => setStartDate(item.value)}
              />
            ))}
          </View>

          {/* start time */}
          <View className="flex flex-col gap-3">
            <View className="flex flex-row justify-start items-center gap-5">
              <Text className="font-semibold text-lg text-left">
                  Start time
              </Text>
              <Switch value={startTimeToggleOn} onValueChange={() => setStartTimeToggleOn(prev => !prev)}/>
            </View>
            {startTimeToggleOn && (
              <TouchableOpacity className="flex-1 flex-row bg-white border border-black px-4 
              rounded-[5px] h-[50px] items-center gap-3" onPress={openStartTimePicker}>
                  <MaterialIcons name="access-time" size={24} color="gray" />
                  <Text className={`flex-1 font-medium ${startTimeStr ? "text-black" : 
                  "text-gray-500"} text-base`}>
                      {startTimeStr || "Select start time"}
                  </Text>
              </TouchableOpacity> 
            )}
            {/* ios date picker */}
            { startPickerOpen && (
                <View className="bg-white rounded-xl p-2 shadow-sm items-center">
                  <DateTimePicker 
                    value = {tempStartTime || new Date()}
                    mode="time"
                    is24Hour
                    onChange={(event, time) => {
                      if (time) {
                        setTempStartTime(time);
                      }
                    }}
                  />
                  <View className="flex flex-row justify-between px-3 w-full">
                    <Pressable hitSlop={14} onPress={() => {
                      setTempStartTime(startTime);
                      setStartPickerOpen(false);
                    }}>
                      <Text className="text-red-500 font-medium text-base">
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable hitSlop={14} onPress={() => {
                      setStartTime(tempStartTime || new Date()); // if onChange is not fired then the time picker actually shows the default time which is now
                      setStartPickerOpen(false);
                    }}>
                      <Text className="text-green-700 font-medium text-base">
                        Save
                      </Text>
                    </Pressable>
                  </View>
                </View>
            )}
          </View>
          
          {/* end date */}
          <View className="flex flex-col gap-3">
            <View className="flex flex-row justify-start items-center gap-5">
              <Text className="font-semibold text-lg text-left">
                  End date
              </Text>
              <Switch value={endDateToggleOn} onValueChange={() => setEndDateToggleOn(prev => !prev)}/>
            </View>
            {endDateToggleOn && (daysLoading ? (
               <View className="flex justify-center items-center">
                  <Loading size={hp(7)} />
                </View>
              ) : (
              <Dropdown
              style={{height: 50, backgroundColor: "white", paddingHorizontal: 16, borderRadius: 5,
                borderColor: "black", borderWidth: 1}}
              data={data}
              search
              searchPlaceholder="Search..."
              labelField="label"
              valueField="value"
              placeholder="Select end date"
              placeholderStyle={{color: "gray"}}
              selectedTextStyle={{fontWeight: 500, color: "black", fontSize: 16}}
              inputSearchStyle={{fontWeight: 500, color: "black", fontSize: 16}}
              value={endDate}
              onChange={item => setEndDate(item.value)}
              />
            ))}
          </View>

          {/* end time */}
          <View className="flex flex-col gap-3">
            <View className="flex flex-row justify-start items-center gap-5">
              <Text className="font-semibold text-lg text-left">
                  End time
              </Text>
              <Switch value={endTimeToggleOn} onValueChange={() => setEndTimeToggleOn(prev => !prev)}/>
            </View>
            {endTimeToggleOn && (
              <TouchableOpacity className="flex-1 flex-row bg-white border border-black px-4 
              rounded-[5px] h-[50px] items-center gap-3" onPress={openEndTimePicker}>
                  <MaterialIcons name="access-time" size={24} color="gray" />
                  <Text className={`flex-1 font-medium ${endTimeStr ? "text-black" : 
                  "text-gray-500"} text-base`}>
                      {endTimeStr || "Select end time"}
                  </Text>
              </TouchableOpacity> 
            )}
            {/* ios date picker */}
            { endPickerOpen && (
                <View className="bg-white rounded-xl p-2 shadow-sm items-center">
                  <DateTimePicker 
                    value = {tempEndTime || new Date()}
                    mode="time"
                    is24Hour
                    onChange={(event, time) => {
                      if (time) {
                        setTempEndTime(time);
                      }
                    }}
                  />
                  <View className="flex flex-row justify-between px-3 w-full">
                    <Pressable hitSlop={14} onPress={() => {
                      setTempEndTime(endTime);
                      setEndPickerOpen(false);
                    }}>
                      <Text className="text-red-500 font-medium text-base">
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable hitSlop={14} onPress={() => {
                      setEndTime(tempEndTime || new Date()); // if onChange is not fired then the time picker actually shows the default time which is now
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

          {/* description input */}
          <View className="flex flex-col gap-3">
            <Text className="font-semibold text-lg text-left">
              Description
            </Text>
            <View className="bg-white border border-black px-4 py-4 rounded-[5px]">
              <TextInput
                multiline
                numberOfLines={8}
                value={description}
                autoCapitalize="none"
                onChangeText={setDescription}
                className="flex-1 font-medium text-black text-base"
                style={{textAlignVertical: "top"}}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    )
  )
}

export default AddTransportationCard