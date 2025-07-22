import { View, Text, TextInput, Alert, TouchableOpacity, Platform, KeyboardAvoidingView, Switch, Image, Linking, FlatList, Pressable, ScrollView} from 'react-native'
import React, { useEffect, useLayoutEffect, useState, useCallback} from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/context/authContext';
import { getOrderInTab } from '@/apis/tripApi';
import { isAxiosError } from 'axios';
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { timeStrToDate, toTimeStr } from '@/utils/dateTimeConverter';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getUploadPicUrl, getUploadDocUrl, getCard, updateCard } from '@/apis/cardApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { pickPics } from '@/utils/imagePicker';
import mime from 'mime';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import Entypo from '@expo/vector-icons/Entypo';
import DisplayPhotoModal from '@/components/DisplayPhotoModal';
import { uploadPhotos } from '@/apis/photoApi';
import { Divider, Menu } from 'react-native-paper';
import { Doc, DocWithType, DocWithUrl } from '@/types/cards';
import { getDocumentAsync } from 'expo-document-picker';
import { handleDelete } from '@/utils/handleDelete';

const EditTransportationCard = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const {id, cardId} = useLocalSearchParams();
    const router = useRouter();
    const ios = Platform.OS === 'ios';
    const [title, setTitle] = useState("");
    const [departureAddress, setDepartureAddress] = useState("");
    const [arrivalAddress, setArrivalAddress] = useState("");
    const [description, setDescription] = useState("");
    const [daysLoading, setDaysLoading] = useState(false);
    const [daysErr, setDaysErr] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const [menuOpen, setMenuOpen] = useState(false);
    const [newImages, setNewImages] = useState<{uri: string, mimeType: string}[]>([]);
    const [oldImages, setOldImages] = useState<{_id: string, key: string, url: string}[]>([]);
    const [imagesToDisplay, setImagesToDisplay] = useState<string[]>([]); 
    const [imageLoading, setImageLoading] = useState(false);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [displayUri, setDisplayUri] = useState("");
    const [uploadSomePicErr, setUploadSomePicErr] = useState(false); // if certain images failed to upload, will allow user proceed to finish creating card
    const [uploadAllPicErr, setUploadAllPicErr] = useState(false); // if the outer try block for uploadImages fail, not allow user proceed to create the card
    const [picIds, setPicIds] = useState<string[]>([]);

    const [urls, setUrls] = useState<string[]>([]);

    const [newDocs, setNewDocs] = useState<DocWithType[]>([]);
    const [docsToDisplay, setDocsToDisplay] = useState<(DocWithType | DocWithUrl)[]>([]);
    const [docLoading, setDocLoading] = useState(false);
    const [uploadSomeDocErr, setUploadSomeDocErr] = useState(false); // if certain docs failed to upload, will allow user proceed to finish creating card
    const [uploadAllDocErr, setUploadAllDocErr] = useState(false); // if the outer try block for uploadFiles fail, not allow user proceed to create the card
    const [docs, setDocs] = useState<Doc[]>([]);

    useEffect(() => {
        setLoading(true);

        const getCurrentCard = async () => {
            try {
                const token = await getUserIdToken(user);
                const currentCard = await getCard({token, cardId});

                if (!currentCard) {
                    throw new Error("No card is found");
                }
                setTitle(currentCard.title);
                if (currentCard.departureAddress) {
                    setDepartureAddress(currentCard.departureAddress);
                }
                if (currentCard.arrivalAddress) {
                    setArrivalAddress(currentCard.arrivalAddress);
                }
                if (currentCard.startDate) {
                    setStartDateToggleOn(true);
                    setStartDate(currentCard.startDate);
                }
                if (currentCard.startTime) {
                    setStartTimeToggleOn(true);
                    setStartTime(timeStrToDate(currentCard.startTime));
                }
                if (currentCard.endDate) {
                    setEndDateToggleOn(true);
                    setEndDate(currentCard.endDate);
                }
                if (currentCard.endTime) {
                    setEndTimeToggleOn(true);
                    setEndTime(timeStrToDate(currentCard.endTime));
                }
                if (currentCard.description) {
                    setDescription(currentCard.description);
                }
                if (currentCard.picIds.length > 0 && currentCard.picUrls.length > 0) {
                    setImagesToDisplay(currentCard.picUrls);
                    setOldImages(currentCard.picIds);
                    setPicIds(currentCard.picIds.map((pic: {_id: string, key: string}) => pic._id));
                } 
                if (currentCard.webUrls.length > 0) {
                    setUrls(currentCard.webUrls);
                }
                if (currentCard.docs.length > 0) {
                    setDocsToDisplay(currentCard.docs);
                    setDocs(currentCard.docs.map((doc: DocWithUrl) => ({name: doc.name, key: doc.key})));
                }
            } catch (e) {
                console.log(e)
                Alert.alert("Update Transportation card", 
                    "Cannot load this Transportation card",
                    [{
                        text: "Back to card detail screen",
                        onPress: () => router.back()
                    }])
            } finally {
                setLoading(false);
            }
        };
        getCurrentCard();
    }, [])

    useEffect(() => {
        if (!startDateToggleOn) {
            setStartDate(null);
        }
        if (!endDateToggleOn) {
            setEndDate(null);
        }
        if (!startDateToggleOn && !endDateToggleOn) {
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
                const daysValues = days.map(day => day.value);
                setData(days);
                let err = [];
                if (startDate && !daysValues.includes(startDate)) {
                    setStartDate(null);
                    err.push("Card start date was outside the trip duration and has been reset");
                }
                if (endDate && !daysValues.includes(endDate)) {
                    setEndDate(null);
                    err.push("Card end date was outside the trip duration and has been reset");
                }
                if (err.length === 2) {
                    Alert.alert("Update Transportation card", "Card start date and end date were outside the trip duration and have been reset");
                } else if (err.length === 1) {
                    Alert.alert("Update Transportation card", err[0]);
                } 
                setDaysErr(false);
            } catch (e) {
                setData([]);
                console.log(e);
                Alert.alert("Update Transportation card", "Unable to load this trip’s duration, so start and end dates cannot be changed");
                if (!startDate) {
                    setStartDateToggleOn(false);
                    setStartDate(null);
                }
                if (!endDate) {
                    setEndDateToggleOn(false);
                    setEndDate(null);
                }
                setDaysErr(true);
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

    const addImages = async (source: "camera" | "gallery") => {
        setMenuOpen(false);
        setImageLoading(true);
        try {
            const response = await pickPics(source);
            if (response.success) {
                const uris = response.uris;
                let errorUris: string[] = [];
                const pics = await Promise.all(
                    uris.map(async (uri) => {
                        let mimeType = mime.getType(uri);
                        if (!mimeType) {
                            try {
                                const picContext = await ImageManipulator.manipulate(uri);
                                const picRef = await picContext.renderAsync();
                                const picRes = await picRef.saveAsync({
                                    compress: 0.7,
                                    format: SaveFormat.JPEG
                                });
                                if (!picRes?.uri) {
                                    throw new Error("No URI is returned from the saved cropped picture");
                                }
                                return {uri: picRes.uri, mimeType: "image/jpeg"};
                            } catch {
                                errorUris.push(uri);
                                return {uri, mimeType: undefined}
                            }
                        }
                        return {uri, mimeType};
                    })
                )
                if (errorUris.length !== 0) {
                    const successfulPics = pics.filter(pic => !errorUris.includes(pic.uri) && pic.mimeType !== undefined)
                        .map(pic => ({
                            ...pic,
                            mimeType: pic.mimeType!, // non-null assertion operator for TS to understand the type
                        }));
                    if (successfulPics.length === 0) {
                        Alert.alert("Add photos", "An error occured when loading the photo(s) you just uploaded", 
                            [{
                                text: "Cancel upload"
                            }])
                        return;
                    }
                    Alert.alert("Add photos", "Some photos have unknown file types and were skipped. You can try adding them later")
                    setNewImages(prev => {
                        const existingUris = new Set(prev.map(pic => pic.uri));
                        const newSuccessfulPics = successfulPics.filter(pic => !existingUris.has(pic.uri));
                        return [...prev, ...newSuccessfulPics];
                    });
                    setImagesToDisplay(prev => {
                        const existingPic = new Set(prev);
                        const picsToBeAdded = successfulPics.map(pic => pic.uri)
                            .filter(uri => !existingPic.has(uri));
                        return [...prev, ...picsToBeAdded];
                    })
                }
                const successfulPics = pics.map(pic => ({...pic, mimeType: pic.mimeType!})); // all pics are successful actually in this case
                setNewImages(prev => {
                    const existingUris = new Set(prev.map(pic => pic.uri));
                    const newSuccessfulPics = successfulPics.filter(pic => !existingUris.has(pic.uri));
                    return [...prev, ...newSuccessfulPics];
                });
                setImagesToDisplay(prev => {
                    const existingPic = new Set(prev);
                    const picsToBeAdded = successfulPics.map(pic => pic.uri)
                        .filter(uri => !existingPic.has(uri));
                    return [...prev, ...picsToBeAdded];
                })
            } else if (response.message) {
                Alert.alert("Add photos", response.message);
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Add photos", "Failed to select profile picture - please try again");
        } finally {
            setImageLoading(false);
        }
    }

    const openDisplayModal = (uri: string) => {
        setDisplayModalOpen(true);
        setDisplayUri(uri);
    }

    const deletePhoto = (uri: string) => {
        setNewImages(prev => prev.filter(pic => pic.uri !== uri));
        const id = oldImages.find(pic => pic.url === uri)?._id;
        setOldImages(prev => prev.filter(pic => pic.url !== uri));
        setImagesToDisplay(prev => prev.filter(pic => pic !== uri));
        setPicIds(prev => prev.filter(picId => picId !== id));
    }

    const handleDeletePhoto = (uri: string) => {
        handleDelete("Delete photo", "Are you sure you want to delete this photo?", () => deletePhoto(uri))
    }

    const closeDisplayModal = () => {
        setDisplayModalOpen(false);
        setDisplayUri("");
    }

    const uploadImages = async () => {
        try{
            const token = await getUserIdToken(user);
            const keys = await Promise.all(newImages.map(async (image) => {
                try {
                    const {key, url} = await getUploadPicUrl({token, mimeType: image.mimeType});
                    if (!key || !url) {
                        throw new Error("Failed to retrieve upload link for AWS S3");
                    }
                    const resource = await fetch(image.uri);
                    const blob = await resource.blob();
                    const response = await fetch(url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": image.mimeType,
                        },
                        body: blob,
                    });
                    if (!response.ok) {
                        throw new Error("Failed to upload this photo to AWS S3");
                    }
                    return key;
                } catch {
                    setUploadSomePicErr(true);
                    return null;
                }
            }));
            const successfulKeys = keys.filter(key => key !== null);
            const picIdsRes = await uploadPhotos({token, tripId: id, keys: successfulKeys});
            setPicIds(prev => [...prev, ...picIdsRes]);
            setUploadAllPicErr(false);
            return true;
        } catch (e) {
            console.log(e);
            setUploadAllPicErr(true);
            Alert.alert("Failed to upload all selected photos", "Please try again later");
            return false;
        }
    }

    const addUrl = () => {
        setUrls(prev => [...prev, ""]);
    };

    const updateUrl = (text: string, index: number) => {
        setUrls(prev => {
            const urls = [...prev];
            urls[index] = text;
            return urls;
        })
    };

    const deleteUrl = (index: number) => {
        setUrls(prev => {
            const urls = [...prev];
            urls.splice(index, 1);
            return urls;
        })
    };

    const handleDeleteUrl = (index: number) => {
        handleDelete("Delete url", "Are you sure you want to delete this url?", () => deleteUrl(index))
    }

    const addDoc = async () => {
        setDocLoading(true);
        const res = await getDocumentAsync({
            type: ["application/pdf", "application/msword", 
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
            copyToCacheDirectory: true,
            multiple: true
        });
        if (res.canceled) {
            return;
        }
        const newDocs = res.assets.map(doc => ({uri: doc.uri, name: doc.name, mimeType: doc.mimeType}));
        if (newDocs.some(doc => !doc.mimeType)) {
            Alert.alert("Add document", "Some files have unknown file types and were skipped. You can try adding them later.");
            const docsWithType = newDocs.filter(doc => doc.mimeType)
                .map(doc => ({...doc, mimeType: doc.mimeType!}));
            setNewDocs(prev => {
                const existingUris = new Set(prev.map(doc => doc.uri));
                const nonRepeatDocs = docsWithType.filter(doc => !existingUris.has(doc.uri));
                return [...prev, ...nonRepeatDocs];
            });
            setDocsToDisplay(prev => {
                // only newly added docs might contain repeats so just need to check those have uris which are newly added
                const existingDocs = new Set(prev.filter(doc => "uri" in doc).map(doc => doc.uri));
                const nonRepeatDocs = docsWithType.filter(doc => !existingDocs.has(doc.uri));
                return [...prev, ...nonRepeatDocs];
            });
            return;
        }
        const docsWithTypeGuard = newDocs.map(doc => ({...doc, mimeType: doc.mimeType!}));
        setNewDocs(prev => {
            const existingUris = new Set(prev.map(doc => doc.uri));
            const nonRepeatDocs = docsWithTypeGuard.filter(doc => !existingUris.has(doc.uri));
            return [...prev, ...nonRepeatDocs];
        });
        setDocsToDisplay(prev => {
            // only newly added docs might contain repeats so just need to check those have uris which are newly added
            const existingDocs = new Set(prev.filter(doc => "uri" in doc).map(doc => doc.uri));
            const nonRepeatDocs = docsWithTypeGuard.filter(doc => !existingDocs.has(doc.uri));
            return [...prev, ...nonRepeatDocs];
        });
        setDocLoading(false);
    }

    const openDoc = async (uri: string, name: string) => {
        try {
            const canOpen = await Linking.canOpenURL(uri);
            if (canOpen) {
                await Linking.openURL(uri);
            } else {
                Alert.alert("Open file", `No app found to open ${name}`);
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Open file", `Failed to open ${name}`);
        }
    }

    const deleteDoc = (uri: string) => {
        setNewDocs(prev => prev.filter(doc => doc.uri !== uri));
        setDocsToDisplay(prev => prev.filter(doc => {
            if ("uri" in doc) {
                return doc.uri !== uri;
            } else if ("url" in doc) {
                return doc.url !== uri;
            } else {
                return true;
            }
        }))
    };

    const handleDeleteDoc = (uri: string, name: string) => {
        handleDelete("Delete document", `Are you sure you want to delete ${name}?`, () => deleteDoc(uri))
    }

    const uploadFiles = async () => {
        try{
            const token = await getUserIdToken(user);
            const documents = await Promise.all(newDocs.map(async (doc) => {
                try {
                    const {key, url} = await getUploadDocUrl({token, mimeType: doc.mimeType});
                    if (!key || !url) {
                        throw new Error("Failed to retrieve upload link for AWS S3");
                    }
                    const resource = await fetch(doc.uri);
                    const blob = await resource.blob();
                    const response = await fetch(url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": doc.mimeType,
                        },
                        body: blob,
                    });
                    if (!response.ok) {
                        throw new Error("Failed to upload this file to AWS S3");
                    }
                    return {name: doc.name, key};
                } catch {
                    setUploadSomeDocErr(true);
                    return null;
                }
            }));
            const successfulDocs = documents.filter(doc => doc !== null);
            setDocs([...docs, ...successfulDocs]);
            setUploadAllDocErr(false);
            return true;
        } catch (e) {
            console.log(e);
            setUploadAllDocErr(true);
            Alert.alert("Failed to upload all documents", "Please try again later");
            return false;
        }
    }

    const updateCurrentCard = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getUserIdToken(user);
            if (uploadAllPicErr) {
                const uploadPicRes = await uploadImages();
                if (!uploadPicRes) {
                    throw new Error("Failed to update Transportation card due to failure in uploading photos");
                }
            }
            if (uploadAllDocErr) {
                const uploadDocRes = await uploadFiles();
                if (!uploadDocRes) {
                    throw new Error("Failed to update Transportation card due to failure in uploading documents");
                }
            }
            if (uploadSomePicErr || uploadSomeDocErr) {
                Alert.alert("Upload photos and documents", 
                "Some photos and documents couldn't be uploaded and were skipped. You can try adding them again from the card detail page.")
            }
            const card = await updateCard({token, cardId, cardType: "transportation", title,
                startDate: startDate || undefined,
                startTime: startTimeStr || undefined,
                endDate: endDate || undefined,
                endTime: endTimeStr || undefined,
                description: description || undefined,
                generalAddress: undefined,
                departureAddress,
                arrivalAddress,
                country: undefined,
                city: undefined,
                picIds,
                docs,
                webUrls: urls
            });
            if (!card) {
                throw new Error("No card is created");
            }
            router.replace(`/trips/${id}/${cardId}/cardDetails`);
        } catch (e) {
            console.log(e);
            if (isAxiosError(e) && e.response?.data?.timeErr) {
                Alert.alert("Failed to update Transportation card", e.response.data.message);
                return;
            }
            Alert.alert("Failed to update Transportation card", "Please try again later");
        } finally {
            setLoading(false);
        }
    }, [title, departureAddress, arrivalAddress, description, startDate, startTimeStr, endDate, endTimeStr, picIds, docs, urls])
    
    const handleUpdate = useCallback(async () => {
        if (!title) {
            Alert.alert("Failed to update Transportation card", "Title cannot be empty");
            return;
        }
        if (startDate && endDate) {
            if (endDate < startDate) {
                Alert.alert("Failed to update Transportation card", "End date must be after start date");
                return;
            }
            if (startDate === endDate && startTimeStr && endTimeStr && endTimeStr < startTimeStr) {
                Alert.alert("Failed to update Transportation card", 
                    "End time must be after start time if start date is same as end date");
                return;
            }
        }
        setLoading(true);
        await updateCurrentCard();
    }, [title, startDate, endDate, startTimeStr, endTimeStr, updateCurrentCard])
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={handleUpdate} hitSlop={14} disabled={loading}>
                    <Text className="font-semibold text-white text-base">
                        Save
                    </Text>
                </Pressable>
            )
        })
    }, [navigation, handleUpdate, loading])

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

                {/* arrival address input */}
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
                    ) : !daysErr ? (
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
                    ) : (startDate && (
                        <View className="bg-white border border-black px-4 rounded-[5px] h-[50px]">
                            <Text className="flex-1 font-medium text-black text-base text-left">
                                {startDate}
                            </Text>
                        </View>
                    )))}
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
                    ) : !daysErr ? (
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
                    ) : (endDate && (
                        <View className="bg-white border border-black px-4 rounded-[5px] h-[50px]">
                            <Text className="flex-1 font-medium text-black text-base text-left">
                                {endDate}
                            </Text>
                        </View>
                    )
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

                {/* photos */}
                <View className="flex flex-col gap-3">
                    <View className="flex flex-row gap-2">
                        <Text className="font-semibold text-lg text-left">
                            Photos
                        </Text>
                        <Menu visible={menuOpen} onDismiss={() => setMenuOpen(false)}
                        anchor={
                            <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
                                <Ionicons name="add-circle" size={24} color="#3B82F6" />
                            </Pressable>
                        }
                        contentStyle={{borderRadius: 10, backgroundColor: "white", elevation: 3}}>
                            <Menu.Item title="Take photo" onPress={() => addImages("camera")} />
                            <Divider />
                            <Menu.Item title="Choose from gallery" onPress={() => addImages("gallery")} />
                        </Menu>
                    </View>
                    <FlatList
                    data={imagesToDisplay}
                    numColumns={3}
                    keyExtractor={(item) => item}
                    columnWrapperClassName="justify-between mb-3"
                    renderItem={({item}) => (
                        <TouchableOpacity className="relative" onPress={() => openDisplayModal(item)}>
                            <Image
                            source={{uri: item}}
                            className="w-[100px] h-[100px] border-neutral-400 border-2"
                            resizeMode="cover"/>
                            <Pressable
                            onPress={() => handleDeletePhoto(item)}
                            className="absolute top-0 right-0 w-6 h-6 bg-neutral-400 flex justify-center 
                            items-center" hitSlop={10}>
                                <Entypo name="cross" size={20} color="white"/>
                            </Pressable>
                        </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}/> 
                    { imageLoading &&
                        <Loading size={hp(8)} /> 
                    }   
                </View>

                {/* urls */}
                <View className="flex flex-col gap-3">
                    <View className="flex flex-row gap-2">
                        <Text className="font-semibold text-lg text-left">
                            Url(s)
                        </Text>
                        <Pressable hitSlop={10} onPress={addUrl}>
                            <Ionicons name="add-circle" size={24} color="#3B82F6" />
                        </Pressable>
                    </View>
                    {urls.map((url, index) => (
                        <View
                        key={`${url}-${index}`}
                        className="flex flex-row justify-between items-center">
                            <View className="flex-1 bg-white border border-black px-4 rounded-[5px] h-[50px] mr-3">
                                <TextInput
                                    value={url}
                                    autoCapitalize="none"
                                    onChangeText={(text) => updateUrl(text, index)}
                                    className="flex-1 font-medium text-black text-base"
                                    style={{textAlignVertical: "center"}}
                                />
                            </View>
                            <Pressable hitSlop={10} onPress={() => handleDeleteUrl(index)}>
                                <Entypo name="circle-with-cross" size={24} color="red"/>
                            </Pressable>
                        </View>
                    ))}          
                </View>

                {/* documents */}
                <View className="flex flex-col gap-3">
                    <View className="flex flex-row gap-2">
                        <Text className="font-semibold text-lg text-left">
                            Documents
                        </Text>
                        <Pressable hitSlop={10} onPress={addDoc}>
                            <Ionicons name="add-circle" size={24} color="#3B82F6" />
                        </Pressable>
                    </View>
                    {docsToDisplay.map((doc, index) => (
                        <View
                        key={`${doc.name}-${index}`}
                        className="flex flex-row justify-between items-center gap-5">
                            <Pressable hitSlop={14} onPress={() => {
                                if ("uri" in doc) {
                                    openDoc(doc.uri, doc.name);
                                } else {
                                    openDoc(doc.url, doc.name);
                            }}}>
                                {({pressed}) => (
                                    <Text className={`flex-1 font-medium text-base 
                                        ${pressed ? "text-gray-700" : "text-blue-600"}`}>
                                        {doc.name}
                                    </Text>
                                )}
                            </Pressable>
                            <Pressable hitSlop={10} onPress={() => {
                                if ("uri" in doc) {
                                    handleDeleteDoc(doc.uri, doc.name);
                                } else {
                                    handleDeleteDoc(doc.url, doc.name);
                            }}}>
                                <Entypo name="circle-with-cross" size={24} color="red"/>
                            </Pressable>
                        </View>
                    ))}    
                    { docLoading &&
                        <Loading size={hp(8)} /> 
                    }         
                </View>
            </View>
        </ScrollView>
        <DisplayPhotoModal isVisible={displayModalOpen} picUri={displayUri} 
            closeModal={closeDisplayModal}/>
    </KeyboardAvoidingView>
    )
  )
}

export default EditTransportationCard