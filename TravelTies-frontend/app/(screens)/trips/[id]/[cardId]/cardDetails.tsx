import { Alert, ScrollView, Text, View, TouchableOpacity, Linking, FlatList, Image, Pressable} from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Card } from '@/types/cards';
import { getCard } from '@/apis/cardApi';
import Feather from '@expo/vector-icons/Feather';
import { useActionSheet } from '@expo/react-native-action-sheet';
import DisplayPhotoModal from '@/components/DisplayPhotoModal';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const CardDetails = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const {id, cardId} = useLocalSearchParams();
    const router = useRouter();
    const {user, getUserIdToken} = useAuth();
    const [card, setCard] = useState<Card | null>(null);
    const [isGeneralCard, setIsGeneralCard] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showActionSheetWithOptions } = useActionSheet();
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [displayUri, setDisplayUri] = useState("");

    useEffect(() => {
        setLoading(true);

        const getCurrentCard = async () => {
            try {
                const token = await getUserIdToken(user);
                const currentCard = await getCard({token, cardId});

                if (!currentCard) {
                    throw new Error("No card is found");
                }
                setCard(currentCard);

                if (currentCard.cardType !== "note" && currentCard.cardType !== "destination"
                    && currentCard.cardType !== "transportation") {
                    setIsGeneralCard(true);
                }
            } catch (e) {
                console.log(e)
                Alert.alert("View card", 
                    "Cannot load this card",
                    [{
                        text: "Back to Itinerary main screen",
                        onPress: () => router.back()
                    }])
            } finally {
                setLoading(false);
            }
        };
        getCurrentCard();
    }, [])
    
    useLayoutEffect(() => {
        if (card?.cardType) {
            navigation.setOptions({ title: `${card.cardType.charAt(0) + card.cardType.slice(1)} card`,
                headerRight: () => (
                    <Pressable onPress={() => {
                            if (card.cardType === "note") {
                                router.push(`/trips/${id}/${cardId}/editNoteCard`);
                            } else if (card.cardType === "destination") {
                                router.push(`/trips/${id}/${cardId}/editDestinationCard`);
                            } else if (card.cardType === "transportation") {
                                router.push(`/trips/${id}/${cardId}/editTransportationCard`);
                            } else {
                                router.push(`/trips/${id}/${cardId}/editGeneralCard`);
                            }
                        }} hitSlop={14}>
                        <FontAwesome6 name="edit" size={20} color="white" />
                    </Pressable>
                )})
        }
    }, [navigation, card])

    const viewAddress = async (address: string | undefined, type?: string) => {
        if (!address) {
            Alert.alert("View on map", `No ${type ? (type + " ") : ""}address is provided for ${card?.title || "this card"}`);
            return;
        }
        try {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                throw new Error("Failed to open Google Maps with this address");
            }
            await Linking.openURL(url);
        } catch (e) {
            console.log(e);
            Alert.alert("View on map", `Failed to open Google Maps with this ${type ? (type + " ") : ""}address - please try again`);
        }
    }

    const handleViewOnMap = (departureAddress: string, arrivalAddress: string) => {
        const options = ["View departure address", "View arrival address", "Cancel"];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, (selectedIndex) => {
            if (selectedIndex === 0) {
                viewAddress(departureAddress, "departure");
            } else if (selectedIndex === 1) {
                viewAddress(arrivalAddress, "arrival");
            }
        })
    }

    const openDisplayModal = (uri: string) => {
        setDisplayModalOpen(true);
        setDisplayUri(uri);
    }

    const closeDisplayModal = () => {
        setDisplayModalOpen(false);
        setDisplayUri("");
    }

    const openUrl = async (url: string) => {
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                throw new Error("Unable to open this url");
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Open file", `Failed to open this url`);
        }
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

  return (
    loading ? (
        <View className="flex-1 justify-center items-center">
            <Loading size={hp(12)} />
        </View>
    ) : card && (
        <View className = "flex-1">
            <ScrollView className="flex-1 px-5 pt-5 bg-white" 
                contentContainerStyle={{paddingBottom: insets.bottom}}>
                <View className="flex flex-col gap-5">
                    {/* card title */}
                    <Text className="font-semibold text-2xl text-left">
                        {card.title}
                    </Text>

                    {/* address (for general card) */}
                    { isGeneralCard && card.generalAddress && (
                        <View className="flex flex-row justify-between items-center">
                            <View className="flex-1 mr-3">
                                <Text className="flex-1 font-semibold text-base text-left text-black">
                                    <Text className="text-gray-500">Address:</Text> {card.generalAddress}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => viewAddress(card.generalAddress)}
                            hitSlop={3}
                            className="flex flex-row gap-2.5 bg-blue-400 justify-center items-center 
                            border border-blue-700 shadow-sm h-[40px] px-8 rounded-[30px]">
                                <Feather name="map-pin" size={24} color="white" />
                            </TouchableOpacity>
                        </View> 
                    )}

                    {/* departure and arrival addresses (for transportation card) */}
                    { card.cardType === "transportation" && (card.departureAddress || card.arrivalAddress) && (
                        <View className="flex flex-row justify-between items-center">
                            <View className="flex-1 flex-col gap-3 items-start justify-center mr-3">
                                {card.departureAddress && (
                                    <Text className="flex-1 font-semibold text-base text-left text-black">
                                        <Text className="text-gray-500">Departure address:</Text> {card.departureAddress}
                                    </Text>
                                )}
                                {card.arrivalAddress && (
                                    <Text className="flex-1 font-semibold text-base text-left text-black">
                                        <Text className="text-gray-500">Arrival address:</Text> {card.arrivalAddress}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => {
                                if (card.departureAddress && card.arrivalAddress) {
                                    handleViewOnMap(card.departureAddress, card.arrivalAddress);
                                    return;
                                } else if (card.departureAddress) {
                                    viewAddress(card.departureAddress);
                                    return;
                                } else {
                                    viewAddress(card.arrivalAddress);
                                    return;
                                }
                            }}
                            hitSlop={3}
                            className="flex flex-row gap-2.5 bg-blue-400 justify-center items-center 
                            border border-blue-700 shadow-sm h-[40px] px-8 rounded-[30px]">
                                <Feather name="map-pin" size={24} color="white" />
                            </TouchableOpacity>
                        </View> 
                    )}

                    {/* start */}
                    {(card.startDate || card.startTime) && (
                        <View className="flex flex-row gap-1 justify-start items-center">
                            <Text className="font-semibold text-base text-left text-gray-500">
                                From:
                            </Text>
                            {card.startDate && (
                                <Text className="font-medium text-base text-left">
                                    Day {card.startDate}
                                </Text>
                            )}
                            {card.startTime && (
                                <Text className="font-medium text-base text-left">
                                    {card.startTime}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* end */}
                    {(card.endDate || card.endTime) && (
                        <View className="flex flex-row gap-1 justify-start items-center">
                            <Text className="font-semibold text-base text-left text-gray-500">
                                To: 
                            </Text>
                            {card.endDate && (
                                <Text className="font-medium text-base text-left">
                                    Day {card.endDate}
                                </Text>
                            )}
                            {card.endTime && (
                                <Text className="font-medium text-base text-left">
                                    {card.endTime}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* destination */}
                    { card.cardType === "destination" && (card.country || card.city) && (
                        <View className="flex flex-row gap-1 justify-start items-center">
                            <Text className="font-semibold text-base text-left text-gray-500">
                                Destination: 
                            </Text>
                            {card.country && (
                                <Text className="font-medium text-base text-left">
                                    {card.country}
                                </Text>
                            )}
                            {card.city && (
                                <Text className="font-medium text-base text-left">
                                    {card.city}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* description */}
                    { card.description && (
                        <View className="flex flex-row gap-1 justify-start items-center">
                            <Text className="font-semibold text-base text-left text-gray-500">
                                Description:
                            </Text>
                            <Text className="font-medium text-base text-left">
                                {card.description}
                            </Text>
                        </View>
                    )}

                    {/* photos */}
                    {card.picUrls.length > 0 && (
                        <View className="flex flex-col gap-3">
                            <Text className="font-semibold text-base text-left text-gray-500">
                                Photos
                            </Text>
                        <FlatList
                        data={card.picUrls}
                        numColumns={3}
                        keyExtractor={(item, index) => index.toString()}
                        columnWrapperClassName="justify-between mb-3"
                        renderItem={({item}) => (
                            <TouchableOpacity className="relative" onPress={() => openDisplayModal(item)}>
                                <Image
                                source={item === "Failed to load" 
                                ? require("../../../../../assets/images/error-icon.png")
                                : {uri: item}}
                                className="w-[100px] h-[100px] border-neutral-400 border-2"
                                resizeMode="cover"/>
                            </TouchableOpacity>
                        )}/> 
                    </View>
                    )}

                    {/* urls */}
                    {card.webUrls.length > 0 && (
                        <View className="flex flex-col gap-3">
                            <View className="flex flex-row gap-2">
                                <Text className="font-semibold text-base text-left text-gray-500">
                                    Url(s)
                                </Text>
                            </View>
                        {card.webUrls.map((url, index) => (
                            <View
                            key={index}
                            className="flex flex-row justify-between items-center">
                                <View className="w-full bg-white border border-black px-4 rounded-[5px] h-[50px]">
                                    <Pressable hitSlop={14} onPress={() => openUrl(url)}>
                                        {({pressed}) => (
                                            <Text 
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            className={`flex-1 font-medium text-base  
                                                ${pressed ? "text-gray-700" : "text-blue-600"}`}>
                                                {url}
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        ))}          
                    </View>
                    )}

                    {/* documents */}
                    {card.docs.length > 0 && (
                        <View className="flex flex-col gap-3">
                            <View className="flex flex-row gap-2">
                                <Text className="font-semibold text-base text-left text-gray-500">
                                    Documents
                                </Text>
                            </View>
                        {card.docs.map((doc, index) => (
                            <View
                            key={index}
                            className="flex flex-row justify-between items-center">
                                <View className="w-full bg-white border border-black px-4 rounded-[5px] h-[50px]">
                                    {doc.url === "Failed to load" ? (
                                        <Text
                                        className={"font-medium text-base text-left text-red-600"}>
                                            {`Unable to load ${doc.name}. Please try again later.`}
                                        </Text>
                                    ) : (
                                        <Pressable hitSlop={14} onPress={() => openDoc(doc.url, doc.name)}>
                                            {({pressed}) => (
                                                <Text
                                                className={`font-medium text-base text-left
                                                    ${pressed ? "text-gray-700" : "text-blue-600"}`}>
                                                    {doc.name}
                                                </Text>
                                            )}
                                        </Pressable> 
                                    )}
                                </View>
                            </View>
                        ))}          
                    </View>
                    )}
                </View>
            </ScrollView>
            <DisplayPhotoModal isVisible={displayModalOpen} picUri={displayUri} 
            closeModal={closeDisplayModal}/>
        </View>
  ))
}

export default CardDetails
