import { Alert, ScrollView, Text, View, TouchableOpacity, Dimensions} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { getJoinCode } from '@/apis/tripApi';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AntDesign from '@expo/vector-icons/AntDesign';
import Clipboard from "@react-native-clipboard/clipboard";
import QRCode from "react-native-qrcode-svg";

const DisplayTripInfo = () => {
    const insets = useSafeAreaInsets();
    const {id} = useLocalSearchParams();
    const {user, getUserIdToken} = useAuth();
    const [loading, setLoading] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const router = useRouter();
    
    useEffect(() => {
        setLoading(true);

        const getTripJoinCode = async () => {
            try {
                const token = await getUserIdToken(user);
                const currentTrip = await getJoinCode({token, id});

                if (!currentTrip) {
                    throw new Error("No trip is found");
                }

                setJoinCode(currentTrip.joinCode)
             
            } catch (e) {
                console.log(e)
                Alert.alert("View trip info", 
                    "Unable to load this trip's info",
                    [{
                        text: "Back to trip overview",
                        onPress: () => router.back()
                    }])
            } finally {
                setLoading(false);
            }
        };
        getTripJoinCode();
    }, [])
    
    const copy = () => {
      Clipboard.setString(joinCode);
      Alert.alert("Copied to clipboard!")
    }

    const screenWidth = Dimensions.get("window").width;
    const PADDINGS = 64; // 32-px paddings on left and right
    const QR_SIZE = screenWidth - PADDINGS;

  return (
    loading ? (
        <View className="flex-1 justify-center items-center">
            <Loading size={hp(12)} />
        </View>
    ) : (
        <View className = "flex-1">
          <ScrollView className="flex-1 px-5 pt-5 bg-white" 
              contentContainerStyle={{paddingBottom: insets.bottom}}>
              <View className="flex-1 flex-col gap-10">
                {/* join code */}
                <View className="flex flex-row items-center justify-start gap-3">
                  <Text className="font-medium text-lg">
                    {"Trip ID: "}
                  </Text>
                  <Text className="font-semibold text-2xl">
                    {joinCode}
                  </Text>
                  
                  {/* copy button */}
                  <TouchableOpacity hitSlop={14} onPress={copy}>
                    <AntDesign name="copy1" size={24} color="gray" />
                  </TouchableOpacity>
                </View>

                {/* QR code */}
                <View className="flex flex-col gap-6 w-full items-center">
                  <Text className="font-medium text-lg self-start">
                    Trip QR code:
                  </Text>
                  <QRCode value={joinCode} size={QR_SIZE} />
                </View>
              </View>
            </ScrollView>
          </View>
  ))
}

export default DisplayTripInfo