import { View, Text, Alert, TouchableWithoutFeedback, Keyboard, TextInput, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/authContext';
import { useEffect, useRef, useState } from 'react';
import CustomKeyboardView from '@/components/CustomKeyboardView';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getTripOverviewByJoinCode } from '@/apis/tripApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Trip } from '@/types/trips';
import QRScanner from '@/components/QRScanner';
import JoinTripModal from '@/components/JoinTripModal';

const JoinTrip = () => {
    const insets = useSafeAreaInsets();
    const {user, getUserIdToken} = useAuth();
    const joinCodeRef = useRef("");
    const [loading, setLoading] = useState(false);
    const [trip, setTrip] = useState<Trip | null>(null);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const token = await getUserIdToken(user);
            const trip = await getTripOverviewByJoinCode({token, joinCode: joinCodeRef.current});
            if (!trip) {
                throw new Error("No trip found with this join code");
            }
            setTrip(trip);
        } catch (e) {
            console.log(e);
            setTrip(null);
            Alert.alert("Join with trip ID", "No trip found with this join code");
        } finally {
            setLoading(false);
        }
    }

    const passTrip = (trip: Trip) => {
        setTrip(trip);
    }

    const closeScanner = () => {
        setScannerOpen(false);
    }

    const closeJoinModal = () => {
        setJoinModalOpen(false);
        setTrip(null);
    }

    useEffect(() => {
        if (!trip) {
            return;
        }
        setJoinModalOpen(true);
    }, [trip])

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <CustomKeyboardView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}> 
                <View style={{paddingBottom: insets.bottom}}
                className="flex-1 gap-14 px-5 bg-white items-center justify-center">
                    <View className="flex flex-col gap-7 items-center justify-center">
                        {/* title */}
                        <Text className="text-black text-2xl font-semibold text-center"> 
                            Join with QR code
                        </Text> 
                        {/* open qr scanner button */}
                        <TouchableOpacity onPress={() => setScannerOpen(true)}
                        className='bg-blue-500 justify-center items-center border 
                        border-blue-600 shadow-sm h-[60px] w-[60px] px-8 rounded-[7px]'>
                            <MaterialCommunityIcons name="qrcode-scan" size={50} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex flex-col gap-7 items-center justify-center">
                        {/* joinCode input */}
                        <Text className="text-black text-2xl font-semibold text-center"> 
                            Join with trip ID
                        </Text> 
                        <View className="flex flex-row gap-3 items-center justify-start bg-white border 
                        border-black px-4 rounded-[5px] h-[50px] w-full">
                            <TextInput
                                autoCapitalize="none"
                                onChangeText={value => joinCodeRef.current=value}
                                className="flex-1 font-medium text-black text-base"
                                placeholder="Trip ID"
                                placeholderTextColor={"gray"}
                                style={{textAlignVertical: "center"}}
                            />
                        </View>  
                        {/* search button */}
                        { loading? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(8.5)} />
                            </View>
                            ) : (
                                <TouchableOpacity onPress={handleSearch}
                                className='bg-blue-500 justify-center items-center border 
                                border-blue-600 shadow-sm h-[44px] px-8 rounded-[30px]'>
                                    <Text className='text-white font-semibold tracking-wider text-sm'>
                                        Search
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
        </TouchableWithoutFeedback>
        <QRScanner isVisible={scannerOpen} passTrip={passTrip} closeModal={closeScanner}/>
        {trip && <JoinTripModal trip={trip} isVisible={joinModalOpen} closeModal={closeJoinModal}/>}
    </CustomKeyboardView>
    </>
    )
}

export default JoinTrip