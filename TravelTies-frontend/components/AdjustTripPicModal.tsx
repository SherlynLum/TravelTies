import { View, Text, Alert, Modal, Dimensions, Pressable } from 'react-native';
import React, { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Loading from './Loading';
import {clamp} from "react-native-redash";

type AdjustPicModalProps = {
    isVisible: boolean,
    picUri: string,
    width: number,
    height: number,
    closeModal: () => void,
    completeCrop: (croppedUri: string ) => void;
}

const AdjustPicModal : React.FC<AdjustPicModalProps> = ({isVisible, picUri, width, height, closeModal, completeCrop}) => {
    const [loading, setLoading] = useState(false);

    const screenWidth = Dimensions.get("window").width;
    const cropHeight = screenWidth / 3;

    // find the max between width-based and height-based scaling to get the max possible square
    // this scale will be used to resize the image initially, before even applying animated style
    // get the width and height after scaling 
    const initialScale = Math.max(screenWidth / width, cropHeight / height);
    const scaledWidth = width * initialScale;
    const scaledHeight = height * initialScale;

    // initiate startScale and offsetScale to 1 for animated style
    const startScale = useSharedValue(1);
    const offsetScale = useSharedValue(1);

    // centralise the square area, assume crop area start from the top left corner
    // initially, crop area will just shift down or right
    // crop area shift right means image shift left, initialX should be negative
    // crop area shift down means image shift up, initialX should be negative
    // initialPos should be based on the original pixel coordinate 
    // scaledWidth and scaledHeight are always bigger than or equals to screenWidth 
    const initialX = (screenWidth - scaledWidth) / 2;
    const initialY = (cropHeight - scaledHeight) / 2;

    // initiate startPos and offsetPos with initialX and initialY
    const startPos = useSharedValue({x: initialX, y: initialY});
    const offsetPos = useSharedValue({x: initialX, y: initialY});

    // to keep track of the crop area, initiaate cropPos with -initialX and -initialY 
    // this cropPos is the coordinates of the top left corner of the crop area with respect to the pic
    // crop area has a size of screenWidth * screenWidth
    const cropPos = useSharedValue({x: -initialX, y: - initialY});

    // we will scale first then translate 
    // thus, offsetPos is in terms of the current scale 
    // however when added to the cropPos, it should be adjusted to the original image pixel
    
    // function to recalculate cropPos after pan or pinch gesture
    const updateCropPos = () => {
        "worklet"; // Reanimated can only call a function marked as 'worklet' when running on the UI thread
        cropPos.value = {
            x: -offsetPos.value.x / offsetScale.value,
            y: -offsetPos.value.y / offsetScale.value
        }
    }

    // handle shifting
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // update offsetPos
            const offsetLowerBoundX = screenWidth - scaledWidth * offsetScale.value;
            const offsetLowerBoundY = cropHeight - scaledHeight * offsetScale.value;
            offsetPos.value = { 
                x: clamp(startPos.value.x + e.translationX, offsetLowerBoundX, 0),
                y: clamp(startPos.value.y + e.translationY, offsetLowerBoundY, 0),
            };
        })
        .onEnd(() => {
            // set the startPos to the offsetPos
            startPos.value = {
                x: offsetPos.value.x,
                y: offsetPos.value.y,
            };

            // update cropPos when pan finished
            updateCropPos();
        })
    
    // handle zooming
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            // min scale is 1, max scale is 3 
            offsetScale.value = clamp(startScale.value * e.scale, 1, 3);
        })
        .onEnd(() => {
            startScale.value = offsetScale.value;

            // update cropPos when pinch finished
            updateCropPos();
        })

    // scale first then translate
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {scale: offsetScale.value},
            {translateX: offsetPos.value.x},
            {translateY: offsetPos.value.y}
        ]
    }))
    
    const cropPic = async () => {
        try{
            setLoading(true);
            const picContext = ImageManipulator.manipulate(picUri)
                .crop({
                    originX: cropPos.value.x / initialScale,
                    originY: cropPos.value.y / initialScale,
                    height: cropHeight / (initialScale * offsetScale.value),
                    width: screenWidth / (initialScale * offsetScale.value)
                })
            const picRef = await picContext.renderAsync();
            const picRes = await picRef.saveAsync({
                compress: 0.7,
                format: SaveFormat.JPEG,
            });
            if (!picRes?.uri) {
                throw new Error("No URI is returned from the saved cropped picture")
            }
            setLoading(false);
            completeCrop(picRes.uri);
        } catch (e) {
            console.log(e);
            Alert.alert("Pick profile picture", "Failed to save cropped picture", [{
                text: "Back to onboard",
                onPress: closeModal
            }])
        }
    }

  return (
    <View className="flex-1">
        <StatusBar 
                translucent
                backgroundColor="transparent"
                style="dark"
        />
        <Modal visible={isVisible} animationType="slide">
            <View className="absolute top-0 bottom-0 left-0 right-0 bg-black">
                <SafeAreaView className="flex-1">
                    {/* header */}
                    <View style={{paddingHorizontal: wp(3), height: 56, width: "100%"}}
                    className="flex-row items-center justify-between">
                        <Pressable onPress={closeModal} hitSlop={14}>
                            <Text style={{fontSize: hp(1.8)}} className="font-medium text-white">
                                Cancel 
                            </Text>
                        </Pressable>

                        <Text style={{fontSize: hp(1.8)}} className="font-medium text-white">
                            Adjust and scale
                        </Text>

                        <Pressable onPress={cropPic} hitSlop={14}>
                            <Text style={{fontSize: hp(1.8)}} className="font-medium text-white">
                                Save
                            </Text>
                        </Pressable>
                    </View>

                    <View className="flex-1 justify-center items-center">
                        {
                            loading ? (
                                <Loading size={hp(10)} />
                            ) : (
                                // adjust profile picture 
                                <View className="overflow-hidden" style={{width: screenWidth, 
                                height: cropHeight}}>
                                    <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
                                        <Animated.Image source={{uri: picUri}}
                                        style={[{width: scaledWidth, height: scaledHeight}, animatedStyle]}
                                        resizeMode="cover" />
                                    </GestureDetector> 
                                </View>
                            )
                        }
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    </View>
  )
}

export default AdjustPicModal