import { View, Text, Modal, Dimensions, Pressable, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';

type AdjustPicModalProps = {
    isVisible: boolean,
    picUri: string,
    closeModal: () => void,
}

const DisplayPicModal : React.FC<AdjustPicModalProps> = ({isVisible, picUri, closeModal}) => {
    const screenWidth = Dimensions.get("window").width;

  return (
    <Modal visible={isVisible} animationType="slide">
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar 
                    translucent
                    backgroundColor="transparent"
                    style="light"
            />

            {/* header */}
            <View style={{paddingHorizontal: wp(3), height: 56, width: "100%"}}
            className="flex-row items-center justify-center">
                <Pressable onPress={closeModal} hitSlop={10}
                style={{position: "absolute", left: wp(3)}}>
                    <Ionicons name="chevron-back-outline" size={24} color="white" />
                </Pressable>

                <Text style={{fontSize: hp(1.8)}} className="font-medium text-white">
                    Profile picture
                </Text>
            </View>

            <View className="flex-1 justify-center items-center">
                <Image source={picUri ? ({uri: picUri}) : 
                require("../assets/images/default-user-profile-pic.png")} 
                style={{width: screenWidth, height: screenWidth}} />
            </View>
        </SafeAreaView>
    </Modal>
  )
}

export default DisplayPicModal