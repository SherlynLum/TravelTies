import { Image, View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture } from "react-native-gesture-handler";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"

type AdjustPicModalProps = {
    picUri: string,
    width: number,
    height: number,
    closeModal: () => void
}

const AdjustPicModal : React.FC<AdjustPicModalProps> = ({picUri, width, height, closeModal}) => {
    // find the min between w and h so that later can get a maximum square area
    const minSide = Math.min(width, height);
    // centralise the square area, assume crop area start from the top left corner
    // initially, crop area will just shift down or right
    // crop area shift right means image shift left, initialX should be negative
    // crop area shift down means image shift up, initialX should be positive
    // minSide should always be smaller or equal to w and h
    const initialX = - Math.abs(minSide - width) / 2;
    const initialY = Math.abs(minSide - height) / 2;

    const startScale = useSharedValue(1);
    const offsetScale = useSharedValue(1);
    const startPos = useSharedValue({x: initialX, y: initialY});
    const offsetPos = useSharedValue({x: initialX, y: initialY});

    // handle shifting
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            offsetPos.value = { // translation always adjust to scale 1
                x: startPos.value.x + e.translationX / offsetScale.value, 
                y: startPos.value.y + e.translationY / offsetScale.value,
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
            // min scale is 1, max scale is 3
            offsetScale.value = Math.max(1, Math.min(startScale.value * e.scale, 3));
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
        const picContext = ImageManipulator.manipulate(picUri)
            .crop({
                originX: offsetPos.value.x,
                originY: offsetPos.value.y,
                height: minSide / offsetScale.value,
                width: minSide / offsetScale.value
            })
            .resize({ // resize to framse size after cropped to get the square part selected
                height: 300,
                width: 300
            })
        const picRef = await picContext.renderAsync();
        const picRes = await picRef.saveAsync({
            format: SaveFormat.JPEG,
        });
        return picRes;
    }

  return (
    <View>
      <Text>AdjustPicModal</Text>
    </View>
  )
}

export default AdjustPicModal