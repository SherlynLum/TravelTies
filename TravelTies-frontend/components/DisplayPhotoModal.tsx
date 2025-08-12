import { View, Modal, Pressable, Image } from 'react-native';
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

const DisplayPhotoModal : React.FC<DisplayPicModalProps> = ({isVisible, picUri, closeModal}) => {
    const insets = useSafeAreaInsets();
  return (
    <Modal visible={isVisible} animationType="slide">
        <StatusBar 
            translucent
            backgroundColor="transparent"
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
            </View>

            <View className="flex-1 justify-center items-center">
                <Image source={{uri: picUri}}
                style={{width: "100%", height: "100%"}}
                resizeMode="contain" />
            </View>
        </View>
    </Modal>
  )
}

export default DisplayPhotoModal