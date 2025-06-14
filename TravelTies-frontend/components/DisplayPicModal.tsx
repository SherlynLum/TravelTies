import { View, Text, Modal, Dimensions, Pressable, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';

type AdjustPicModalProps = {
    picUri: string,
    closeModal: () => void,
}

const DisplayPicModal : React.FC<AdjustPicModalProps> = ({picUri, closeModal}) => {
    const screenWidth = Dimensions.get("window").width;

  return (
    <View className="flex-1">
        <StatusBar 
                translucent
                backgroundColor="transparent"
                style="dark"
        />
        <Modal visible={true} animationType="slide">
            <View className="absolute top-0 bottom-0 left-0 right-0 bg-black">
                <SafeAreaView className="flex-1">
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
                        <Image source={{uri: picUri}} style={{width: screenWidth, height: screenWidth}} />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    </View>
  )
}

export default DisplayPicModal