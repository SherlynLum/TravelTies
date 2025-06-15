import { View, Text, Alert, Modal, Dimensions, Pressable } from 'react-native';
import React, { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Svg, { Circle, Defs, Mask, Rect } from "react-native-svg";
import Loading from './Loading';

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

    // find the min between w and h so that later can get a maximum square area
    const minSide = Math.min(width, height);
    const initialScale = screenWidth / minSide ;
    // centralise the square area, assume crop area start from the top left corner
    // initially, crop area will just shift down or right
    // crop area shift right means image shift left, initialX should be negative
    // crop area shift down means image shift up, initialX should be negative
    // initialPos should be based on the original pixel coordinate 
    const initialX = (minSide - width) / 2;
    const initialY = (minSide - height) / 2;

    const startScale = useSharedValue(initialScale);
    const offsetScale = useSharedValue(initialScale);
    const startPos = useSharedValue({x: initialX, y: initialY});
    const offsetPos = useSharedValue({x: initialX, y: initialY});

    const clamp = (val: number, min: number, max: number) => {
        return Math.max(min, Math.min(val, max));
    }

    // handle shifting
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // translation always adjust to scale 1
            const newX = startPos.value.x + e.translationX / offsetScale.value;
            const newY = startPos.value.y + e.translationY / offsetScale.value;
            const lowerBoundX = minSide - width * offsetScale.value;
            const lowerBoundY = minSide - height * offsetScale.value;
            offsetPos.value = { 
                x: clamp(newX, lowerBoundX, 0),
                y: clamp(newY, lowerBoundY, 0),
            };
        })
        .onEnd(() => {
            startPos.value = {
                x: offsetPos.value.x,
                y: offsetPos.value.y,
            };
        })
    
    // handle zooming
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            // min scale is initialScale, max scale is 3
            offsetScale.value = clamp(startScale.value * e.scale, initialScale, 3);
        })
        .onEnd(() => {
            startScale.value = offsetScale.value;
        })

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
                    originX: offsetPos.value.x,
                    originY: offsetPos.value.y,
                    height: minSide / offsetScale.value,
                    width: minSide / offsetScale.value
                })
                .resize({ // resize to framse size after cropped to get the square part selected
                    height: screenWidth,
                    width: screenWidth
                })
            const picRef = await picContext.renderAsync();
            const picRes = await picRef.saveAsync({
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
                                height: screenWidth}}>
                                    <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
                                        <Animated.Image source={{uri: picUri}}
                                        style={[{width: screenWidth, height: screenWidth}, animatedStyle]}
                                        resizeMode="cover" />
                                    </GestureDetector>

                                    {/* circular mask */}
                                    <Svg width={screenWidth} height={screenWidth} 
                                    style={{position: "absolute", top: 0, left: 0}}>
                                        <Defs>
                                            <Mask id="mask">
                                                {/* region outside circle should be blurred by the rect later so fill="white" to show through */}
                                                <Rect width={screenWidth} height={screenWidth} fill="white" />

                                                {/* region inside the circle should not be blurred by the rect later so fill="black" to hide*/}
                                                <Circle cx={screenWidth / 2} cy={screenWidth / 2}
                                                r={screenWidth / 2} fill="black" />
                                            </Mask>
                                        </Defs>

                                        {/* blur the region outside circle */}
                                        <Rect width={screenWidth} height={screenWidth} 
                                        fill={"rgba(30, 30, 30, 0.4)"} mask="url(#mask)" />
                                    </Svg>
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