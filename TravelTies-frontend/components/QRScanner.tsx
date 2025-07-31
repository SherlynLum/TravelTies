import { View, Text, Pressable, Alert, Modal } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useCameraPermissions, CameraView } from 'expo-camera';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Loading from './Loading';
import { useFocusEffect, useRouter } from 'expo-router';
import { Trip } from '@/types/trips';
import { getTripOverviewByJoinCode } from '@/apis/tripApi';
import { useAuth } from '@/context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

type QRScannerProps = {
    isVisible: boolean,
    passTrip: (trip: Trip) => void;
    closeModal: () => void;
}

const QRScanner = ({isVisible, passTrip, closeModal}: QRScannerProps) => {
    const {user, getUserIdToken} = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [requested, setRequested] = useState(false);
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            if (!permission || requested) {
                return;
            }
            if (!permission.granted) { // if has requested permission before, code won't reach this block
                requestPermission(); // no need await as i am relying on permission to render 
                setRequested(true);
            }
        }, [permission, requested, requestPermission])
    )

    const handleQRCodeScanned = async ({data}: {data: string}) => {
        if (scanned) { // not allowed scanning more than one at one time
            return; 
        }
        const joinCode = data?.trim();
        if (!joinCode) {
            Alert.alert("Join with QR code", "No trip ID found in this QR code");
            setScanned(false);
            return;
        }
        try {
            const token = await getUserIdToken(user);
            const trip = await getTripOverviewByJoinCode({token, joinCode});
            if (!trip) {
                throw new Error("No trip found with this join code");
            }
            passTrip(trip);
            closeModal();
        } catch (e) {
            console.log(e);
            Alert.alert("Join with QR code", "The Trip ID in this QR code is invalid");
            setScanned(false);
        }
    }

    if (!permission) {
        return (
            <Modal visible={isVisible} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1 px-5 items-center justify-center">
                        <Loading size={hp(12)} />
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }

    if (!permission.granted && requested) {
        return (
            <Modal visible={isVisible} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1 flex-col px-5 items-center justify-center">
                        <Text className="font-medium text-black text-xs">
                            We need access to your camera to scan the trip QR code. Please enable it in your system settings.
                        </Text>
                        <Pressable onPress={closeModal}
                        style={{minHeight: 44, minWidth: 44}}>
                            <Text className="text-xs font-bold text-blue-500">
                                Back to Join a trip screen
                            </Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }

    return (
        <Modal visible={isVisible} animationType="slide">
            <StatusBar 
                translucent
                backgroundColor="transparent"
                style="light"
                />
            <SafeAreaView className="flex-1 bg-black">
                {/* header */}
                <View style={{paddingHorizontal: wp(3), height: 56, width: "100%"}}
                className="flex-row items-center justify-center">
                    <Pressable onPress={closeModal} hitSlop={10}
                    style={{position: "absolute", left: wp(3)}}>
                        <Ionicons name="chevron-back-outline" size={24} color="white" />
                    </Pressable>
                </View>

                {/* camera */}
                <View className="flex-1">
                    <CameraView
                    className="flex-1"
                    onBarcodeScanned={handleQRCodeScanned}
                    barcodeScannerSettings={{barcodeTypes: ["qr"]}}/>
                </View>
            </SafeAreaView>
        </Modal>
)
}

export default QRScanner