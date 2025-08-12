import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';

const PrivacyPolicy = () => {
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
            justifyContent:"center", rowGap: 20}}>
            <Text className="text-2xl text-black font-semibold text-start tracking-wide">
                Privacy policy
            </Text>
            <View className="flex-1 flex-col gap-7">
                <Text className="text-base text-black font-medium text-start">
                    Effective date: 28/07/2025
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    TravelTies always puts your privacy as one of our top priorities. This privacy policy explains how we collect, use, and protect your personal information when you use TravelTies.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We collect your email when you register an account in TravelTies to identify you in the future. If you are not comfortable with this, you can always sign up using your Google account, and we promise that we will not access any sensitive personal information from your Google account.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We collect your username to identify you and allow your friends to search for and add you.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We may collect the profile picture you upload for your account as well as the trip profile pictures you choose to upload for your trips. Trip profile pictures are visible only to travel buddies within that trip. Photos and documents you upload to any of your trips will similarly only be visible to the buddies of that particular trip.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    All photos and documents are stored securely in our AWS S3 bucket with no public access at all.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We may also collect information about how you use TravelTies, including device details and activity logs, to optimise display and fetch data at the right time.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We do not sell or rent your personal information to third parties. We may share your data with trusted service providers such as AWS, Firebase, Render, and MongoDB who help us operate TravelTies under strict confidentiality agreements.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We take reasonable measures to protect your personal information from unauthorised access, disclosure, or misuse.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    You can update your personal information and trip details on TravelTies at any time. Some actions can only be performed by trip admins or creator, but you are always able to update any information you set yourself.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    If you ever wish to withdraw your consent, you can reach out to us via the email provided under the “Tutorial & Support” tab. We will responsibly delete all copies of your personal data.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We may occasionally update this policy, and will notify you of any significant changes through TravelTies.
                </Text>
                <Text className="text-base text-black font-medium text-start">
                    We sincerely hope you enjoy using TravelTies.
                </Text>
            </View>
        </ScrollView>
        </>
    )
}

export default PrivacyPolicy