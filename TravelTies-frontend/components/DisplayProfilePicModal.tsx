import { View, Text, Modal, Dimensions, Pressable, Image } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';

type DisplayPicModalProps = {
    isVisible: boolean,
    picUri: string,
    closeModal: () => void,
}

const DisplayPicModal : React.FC<DisplayPicModalProps> = ({isVisible, picUri, closeModal}) => {
    const screenWidth = Dimensions.get("window").width;
    const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} animationType="slide">
        <StatusBar 
            backgroundColor="black"
            style="light"
        />
        <View className="flex-1 bg-black" style={{paddingTop: insets.top, 
            paddingBottom: insets.bottom, paddingLeft: insets.left, 
            paddingRight: insets.right}}>
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
                <Image source={picUri === "Failed to load" ? require("../assets/images/image-error-icon.png") 
                : picUri ? ({uri: picUri}) : require("../assets/images/default-user-profile-pic.png")} 
                style={{width: screenWidth, height: screenWidth}} />
            </View>
        </View>
    </Modal>
  )
}

export default DisplayPicModal