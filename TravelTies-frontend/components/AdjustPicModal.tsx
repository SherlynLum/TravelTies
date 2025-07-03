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

    // find the max between width-based and height-based scaling to get the max possible square
    // this scale will be used to resize the image initially, before even applying animated style
    // get the width and height after scaling 
    const initialScale = Math.max(screenWidth / width, screenWidth / height);
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
    const initialY = (screenWidth - scaledHeight) / 2;

    // initiate startPos and offsetPos with initialX and initialY
    const startPos = useSharedValue({x: initialX, y: initialY});
    const offsetPos = useSharedValue({x: initialX, y: initialY});

    // to keep track of the crop area, initiate cropPos with -initialX and -initialY 
    // this cropPos is the coordinates of the top left corner of the crop area with respect to the pic
    // crop area has a size of screenWidth * screenWidth
    const cropPos = useSharedValue({x: -initialX, y: - initialY});

    // create a clamp helper function to set the min and max for pan and pinch
    const clamp = (val: number, min: number, max: number) => {
        return Math.max(min, Math.min(val, max));
    }

    // we will scale first then translate 
    // thus, offsetPos is in terms of the current scale 
    // however when added to the cropPos, it should be adjusted to the original image pixel
    
    // function to recalculate cropPos after pan or pinch gesture
    const updateCropPos = () => {
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
            const offsetLowerBoundY = screenWidth - scaledHeight * offsetScale.value;
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
                    originX: cropPos.value.x / initialScale, // undo initialScale to get x-coordinate relative to original image pixels
                    originY: cropPos.value.y / initialScale, // undo initialScale to get y-coordinate relative to original image pixels
                    height: screenWidth / (initialScale * offsetScale.value), // cropWidth in original image pixels
                    width: screenWidth / (initialScale * offsetScale.value) // cropWidth in original image pixels
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
    <Modal visible={isVisible} animationType="slide">
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar 
                    translucent
                    backgroundColor="transparent"
                    style="light"
            />
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
                                style={[{width: scaledWidth, height: scaledHeight}, animatedStyle]}
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
                                fill={"rgba(30, 30, 30, 0.6)"} mask="url(#mask)" />
                            </Svg>
                        </View>
                    )
                }
            </View>
        </SafeAreaView>
    </Modal>
  )
}

export default AdjustPicModal