import { View, Text, ImageBackground, SafeAreaView, Image, Alert, TouchableOpacity, Pressable, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '@/context/authContext.js';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import CustomKeyboardView from '@/components/CustomKeyboardView';

const ForgotPassword = () => {
  const {resetPassword} = useAuth();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

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

  const emailRef = useRef("");

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
    <ImageBackground
        source={require('../assets/images/signup-bg.png')}
        className='flex-1'
        resizeMode='cover'
    >
    <StatusBar 
        translucent
        backgroundColor='transparent'
        style="dark"
    />
    <SafeAreaView className='flex-1'>
      <CustomKeyboardView>
        <View style={{paddingHorizontal: wp(4.07), paddingTop: hp(1.88)}}
        className="flex-1 gap-12 bg-transparent items-center">
          <View style={{top: hp(5.5), width: wp(75.8), height: hp(13.7)}}
          className="bg-transparent justify-center items-center">
            <Image source={require("../assets/images/plane-pic.png")} className="absolute"
            style={{width: wp(31.8), height: hp(14.7), left: wp(45), top: 0}}/>
            <Text style={{fontSize: hp(2.8)}} className="font-medium text-center
            text-black">
              Your All-in-One App for Group Travelling
            </Text> 
          </View> 
            
          <View style={{top: hp(5), width: wp(88), height: hp(57), paddingHorizontal: wp(2.5),
          borderRadius: 30}}
          className="flex flex-col items-center justify-center gap-6 bg-white">
            <View className="flex flex-col items-center justify-center gap-2">
              <MaterialCommunityIcons name="lock-reset" size={hp(10)} color="black" />
              <Text style={{fontSize: hp(4.11)}} className="font-bold tracking-wider text-center"> 
                Forgot password?
              </Text> 
            </View>

            <View className="flex flex-col items-center justify-center gap-7">
              {/* email input */}
              <Text style={{fontSize: hp(2)}} className="font-medium text-center"> 
                Please enter the email address you used during sign-up. 
                We will send password reset instructions to that address.
              </Text> 

              <View className="flex flex-col items-center justify-center gap-4">  
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}> 
                  <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46)}}
                  className='flex-row gap-4 px-4 bg-white border border-black 
                  items-center justify-center'>
                    <Octicons name='mail' size={hp(2.7)} color='black'/>
                    <TextInput
                      autoCapitalize="none"
                      onChangeText={value => emailRef.current=value}
                      style={{fontSize:hp(2)}}
                      className='flex-1 font-medium text-black'
                      placeholder='Email address'
                      placeholderTextColor={'gray'}
                    />
                  </View>
                </TouchableWithoutFeedback>

                {/* submit button */}
                <View>
                { loading? (
                  <View className="flex-row justify-center">
                    <Loading size={hp(8.5)} />
                  </View>
                  ) : (
                    <View style={{paddingVertical: hp(1)}}>
                      <TouchableOpacity onPress={handleResetPassword}
                      style={{height: hp(6.46), width: wp(38), borderRadius: 30}} 
                      className='bg-blue-500 justify-center items-center border border-blue-600'>
                        <Text style={{fontSize: hp(2.7)}} className='text-white font-semibold
                        tracking-wider text-center'>
                            Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
                </View> 
              </View> 

              {/* return to sign in page */}
              <View className="items-center justify-center">
                <Pressable onPress={() => router.push('/signIn')}
                style={{minHeight: 44, minWidth: 44}}>
                  <Text style={{fontSize: hp(1.8)}} className="font-bold text-blue-500">
                    Back to Sign in
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </CustomKeyboardView>
    </SafeAreaView>
    </ImageBackground>
  )
}

export default ForgotPassword