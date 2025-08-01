import { View, Text, ImageBackground, SafeAreaView, Image, Alert, TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '@/context/authContext.js';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';

const EmailVerification = () => {
  const {user, verifyEmail, validateEmailVerification, logout} = useAuth();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  // cooldown to prevent users keep pressing resend button
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

  // handle verifyEmail
  const handleEmailVerification = async () => {
    if (!user) { // although unlikely, check whether user exists in case _layout fail to check
      router.replace("/signIn");
    } else if (cooldown > 0) {
      Alert.alert("Please wait", "We have just sent a verification email" +
        `and please try again in ${cooldown} seconds`);
      return;
    } else {
      setLoading(true);

      const response = await verifyEmail(user);
      setLoading(false);

      if (!response.success) {
        Alert.alert("Email verification", response.message);
      } else {
        setCooldown(60);
      }
    }
  }

  // send verification email once user land on this page
  useEffect(() => {
    handleEmailVerification();
  }, []) 


  const userEmail = user?.email || "your email";

  const checkVerification = async () => {
    const response = await validateEmailVerification();
    if (!response.success) {
      Alert.alert("Email verification", response.message);
    }
  }

  const handleBackToSignUp = async () => {
    const logOutRes = await logout();
    if (!logOutRes.success) {
      Alert.alert("Back to Sign up failed", logOutRes.message);
    } else {
      router.replace("/signUp");
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
            
          <View style={{top: hp(5), width: wp(88), height: hp(62), paddingHorizontal: wp(2.5),
          paddingBottom: hp(1), borderRadius: 30}}
          className="flex flex-col items-center justify-center gap-0 bg-white">
              <Image source={require("../assets/images/email-verification.png")}
              style={{width: wp(23), height: hp(15)}} resizeMode="contain"/>
              <View className="flex flex-col items-center justify-center gap-5">
                <Text style={{fontSize: hp(4.11)}} className="font-bold tracking-wider text-center"> 
                  Verify your email
                </Text>   
                <View className="flex flex-col items-center justify-center gap-1.5">
                  <Text style={{fontSize: hp(2)}} className="font-medium text-center"> 
                    We have sent a verification link to
                  </Text>  
                  <Text style={{fontSize: hp(2.1)}} className="font-bold text-center">
                    {userEmail}
                  </Text>
                </View>
                <Text style={{fontSize: hp(2)}} className="font-medium text-center"> 
                  Please click the link to complete the verification process.
                  If you don’t see the email, try checking your spam folder.
                </Text> 

                {/* resend email button */}
                <View>
                { loading? (
                  <View className="flex-row justify-center">
                    <Loading size={hp(8.5)} />
                  </View>
                  ) : (
                    <View style={{paddingVertical: hp(1)}}>
                      <TouchableOpacity onPress={handleEmailVerification}
                      style={{height: hp(6.46), width: wp(60), borderRadius: 30}} 
                      className='bg-blue-500 justify-center items-center border border-blue-600'>
                        <Text style={{fontSize: hp(2.7)}} className='text-white font-semibold
                        tracking-wider text-center'>
                          Resend email
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
                </View> r

                <View className="flex gap-6">

                  {/* validate email verification */}
                  <View className="items-center justify-center">
                    <Pressable onPress={checkVerification} hitSlop={14}>
                      <Text style={{fontSize: hp(1.8)}} className="font-bold text-blue-500">
                        {"I've already verified"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* return to sign up page */}
                  <View className="items-center justify-center">
                    <Pressable onPress={handleBackToSignUp} hitSlop={16}>
                      <Text style={{fontSize: hp(1.5)}} className="font-bold text-gray-500">
                        Back to Sign up
                      </Text>
                    </Pressable>
                  </View>
                  
                </View>
              </View>
          </View>
        </View>
    </SafeAreaView>
    </ImageBackground>
  )
}

export default EmailVerification