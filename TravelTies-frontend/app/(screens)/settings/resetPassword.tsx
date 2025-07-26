import { View, Text, Alert, TouchableWithoutFeedback, Keyboard, TextInput, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { Octicons } from '@expo/vector-icons';
import { useAuth } from '@/context/authContext';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import CustomKeyboardView from '@/components/CustomKeyboardView';
import Loading from '@/components/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ResetPassword = () => {
    const insets = useSafeAreaInsets();
    const {user, resetPassword} = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const emailRef = useRef("");
    
    useEffect(() => {
        const signInMethod = user?.providerData[0]?.providerId;
        if (signInMethod === "password") {
            return;
        } else if (signInMethod === "google.com") {
            router.replace("/settings/unableResetPassword");
        } else {
            Alert.alert("Reset password", 
            "Unable to reset password because we couldn’t determine your sign-in method.",
            [{
                text: "Back to profile main screen",
                onPress: () => router.replace("/profile")
            }])
        }
    },[])

    useEffect(() => {
        if (cooldown === 0) {
            return; // stop counting down when cooldown equals 0
        } else {
            // every 1000ms cooldown decrease by 1
            const countdown = setTimeout(() => {
                setCooldown(old => old - 1);
            }, 1000)
        
            // clean up countdown if useEffect is called in between countdown
            return () => clearTimeout(countdown)
        }
    }, [cooldown])

    const handleResetPassword = async () => {
        if (!emailRef.current) {
            Alert.alert("Reset password", "Please fill in your email address");
            return;
        } 
    
        if (cooldown > 0) {
            Alert.alert("Please wait", "We have just sent a reset password email" +
                `and please try again in ${cooldown} seconds`);
            return;
        }
        
        setLoading(true);
    
        const response = await resetPassword(emailRef.current);
        setLoading(false)
    
        if (!response.success) {
            Alert.alert("Reset password", response.message);
        } else {
            // differentiate success message from error message
            alert("If this email is registered, a password reset email has been sent successfully");
          
            // start cooldown countdown 
            setCooldown(60);
        }
      }

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        <CustomKeyboardView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}> 
                <View style={{paddingBottom: insets.bottom}}
                className="flex-1 gap-7 px-5 bg-white items-center justify-center">
                    {/* email input */}
                    <Text className="text-black text-base font-medium text-center"> 
                        Please enter the email address you used during sign-up. 
                        We will send password reset instructions to that address.
                    </Text> 
                    <View className="flex flex-row gap-3 items-center justify-start bg-white border 
                    border-black px-4 rounded-[5px] h-[50px] w-full">
                        <Octicons name='mail' size={24} color='black'/>
                        <TextInput
                            autoCapitalize="none"
                            onChangeText={value => emailRef.current=value}
                            className="flex-1 font-medium text-black text-base"
                            placeholder="Email address"
                            placeholderTextColor={"gray"}
                            style={{textAlignVertical: "center"}}
                        />
                    </View>

                    {/* submit button */}
                    { loading? (
                        <View className="flex-row justify-center">
                            <Loading size={hp(8.5)} />
                        </View>
                        ) : (
                            <TouchableOpacity onPress={handleResetPassword}
                            className='bg-blue-500 justify-center items-center border 
                            border-blue-600 shadow-sm h-[44px] px-8 rounded-[30px]'>
                                <Text className='text-white font-semibold tracking-wider text-sm'>
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
        </TouchableWithoutFeedback>
    </CustomKeyboardView>
    </>
    )
}

export default ResetPassword