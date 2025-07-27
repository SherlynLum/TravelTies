import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { Octicons } from '@expo/vector-icons';

const Support = () => {
    const insets = useSafeAreaInsets();
    const tutorialUrl = "";

    const openTutorial = async () => {
        try {
            const canOpen = await Linking.canOpenURL(tutorialUrl);
            if (canOpen) {
                await Linking.openURL(tutorialUrl);
            } else {
                throw new Error("Unable to open tutorial video");
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Open tutorial video", "Unable to open tutorial video");
        }
    }
    

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <ScrollView className="flex-1 flex-col px-5 pt-5 bg-white" 
        contentContainerStyle={{paddingBottom: insets.bottom, alignItems: "flex-start", 
            justifyContent:"center", rowGap: 60}}>
            <View className="flex flex-col gap-5 items-start justify-center w-full">
                <Text className="text-2xl text-black font-semibold text-start tracking-wide">
                    Tutorial
                </Text>
                {tutorialUrl ? (
                    <Pressable hitSlop={14} onPress={openTutorial}>
                        {({pressed}) => (
                            <Text className={`font-medium text-base 
                            ${pressed ? "text-gray-700" : "text-blue-600"}`}>
                                {tutorialUrl}
                            </Text>
                        )}
                    </Pressable>
                ) : (
                    <Text className={"font-medium text-base text-black"}>
                        {"We are updating the tutorial video. Stay tuned :)"}
                    </Text>
                )}
            </View>
            <View className="flex flex-col gap-5 items-start justify-center w-full">
                <Text className="text-2xl text-black font-semibold text-start tracking-wide">
                    Contact us
                </Text>
                <View className="flex flex-row gap-3 w-full items-center justify-start">
                    <Octicons name='mail' size={24} color='black'/>
                    <Text className="text-xl text-black font-medium text-start">
                        travelties@gmail.com
                    </Text>
                </View>
            </View>
        </ScrollView>
        </>
    )
}

export default Support