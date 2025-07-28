import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';

const UnableResetPassword = () => {
    const insets = useSafeAreaInsets();

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <ScrollView className="flex-1 flex-col px-5 pt-3 bg-white" 
        contentContainerStyle={{paddingBottom: insets.bottom, alignItems: "flex-start", 
            justifyContent:"center", rowGap: 56}}>
            <View className="flex flex-col gap-7 items-start justify-center w-full">
                <Text className="text-base text-black font-semibold text-start">
                    You cannot reset your password here
                </Text>
                <Text className="text-xs text-neutral-700 font-medium text-start">
                    You’ve signed in using Google and haven’t linked an email and password to your account, so this feature is not available.
                </Text>
            </View>
            <View className="flex flex-col gap-7 items-start justify-center w-full">
                <Text className="text-base text-black font-semibold text-start">
                    To enable password reset within TravelTies 
                </Text>
                <Text className="text-xs text-neutral-700 font-medium text-start">
                    Press back once to return to the Profile page. At the top, next to your username, tap the edit (pen) icon to link your account with an email and password.
                </Text>
                <Text className="text-xs text-neutral-500 font-medium text-start italic">
                    If you need to reset your Google account password, do so through your Google account settings, not within TravelTies.
                </Text>
            </View>
        </ScrollView>
        </>
    )
}

export default UnableResetPassword