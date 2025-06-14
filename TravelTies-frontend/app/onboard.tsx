import { View, Text, ImageBackground, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { StatusBar } from 'expo-status-bar'
import { Octicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Loading from '../components/Loading.js'
import CustomKeyboardView from '../components/CustomKeyboardView.js'
import { pickOnePic } from '@/utils/imagePicker.js'
import AdjustPicModal from '@/components/AdjustPicModal.js';
import DisplayPicModal from '@/components/DisplayPicModal.js';
import axios from "axios";
import { useAuth } from '@/context/authContext.js';

const Onboard = () => {
    const router = useRouter();
    const {user, setHasOnboarded, getUserIdToken} = useAuth();
    const [picUri, setPicUri] = useState("");
    const [croppedPicUri, setCroppedPicUri] = useState("");
    const [picWidth, setPicWidth] = useState(0);
    const [picHeight, setPicHeight] = useState(0);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // pick profile pic
    const pickProfilePic = async (source: "camera" | "gallery") => {
        try {
            const response = await pickOnePic(source);
            if (response.success) {
                setPicUri(response.uri);
                Image.getSize(response.uri, (width, height) => {
                    setPicWidth(width);
                    setPicHeight(height);
                    setAdjustModalOpen(true);
                });
            } else if (response.message) {
                Alert.alert("Pick profile picture", response.message);
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Pick profile picture", "Failed to select profile picture - please try again");
        }
    }

    const closeAdjustModal = () => {
        setAdjustModalOpen(false);
    }

    const completeAdjustPic = (croppedUri: string) => {
        setAdjustModalOpen(false);
        setCroppedPicUri(croppedUri);
    }

    const closeDisplayModal = () => {
        setDisplayModalOpen(false);
    }

    const usernameRef = useRef("");

    const handleSubmit = async () => {
        if (!usernameRef.current) {
            Alert.alert('Sign in', 'Please fill in username');
            return;
        }

        setLoading(true);
        try {
            const token = await getUserIdToken(user);

            // get presigned url 
            const urlRes = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/profile-pic-url`, {
                    params: {type: "image/jpeg"}, 
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
            const {key, url} = urlRes?.data;
            if (!key || !url) {
                throw new Error("")
            }

            // convert cropped pic uri into binary format to upload
            const resource = await fetch(croppedPicUri);
            const blob = await resource.blob();

            // upload to presigned uri
            const uploadRes = await axios.put(url, blob, {
                headers: {
                    "Content-Type": "image/jpeg"
                }
            });
        }

        setLoading(false);
    }
   
  return (
    <ImageBackground
        source={require("../assets/images/signup-bg.png")}
        className="flex-1"
        resizeMode="cover"
    >
    <StatusBar 
        translucent
        backgroundColor="transparent"
        style="dark"
    />
    <SafeAreaView className="flex-1">
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

                <View style={{top: hp(5), width: wp(88), height: hp(59), paddingHorizontal: wp(2.5),
                paddingTop: hp(2.5), paddingBottom: hp(4), borderRadius: 30}}
                className="flex flex-col justify-center item-center gap-6 bg-white">
                    <Text style={{fontSize: hp(4.11)}} className="font-bold tracking-wider text-center"> 
                        Welcome back
                    </Text>   

                    {/* inputs */}
                    <View className="gap-5">
                        <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46)}}
                        className="flex-row gap-4 px-4 left-1/2 -translate-x-1/2 bg-white 
                        border border-black items-center">
                            <Octicons name="mail" size={hp(2.7)} color="black" />
                            <TextInput
                                autoCapitalize="none"
                                onChangeText={value=> emailRef.current=value}
                                style={{fontSize:hp(2)}}
                                className="flex-1 font-medium text-black"
                                placeholder="Email address"
                                placeholderTextColor={"gray"}
                            />
                        </View>
                        <View className="gap-4">
                            <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46),
                            paddingHorizontal:wp(4), gap: wp(3.8)}}
                            className="flex-row left-1/2 -translate-x-1/2 bg-white 
                            border border-black items-center">
                                <Octicons name="lock" size={hp(2.8)} color="black" />
                                <TextInput
                                    autoCapitalize="none"
                                    onChangeText={value=> passwordRef.current=value}
                                    style={{fontSize:hp(2)}}
                                    className="flex-1 font-medium text-black"
                                    placeholder="Password"
                                    secureTextEntry
                                    placeholderTextColor={"gray"}
                                />
                            </View>
                            <View style={{paddingHorizontal: wp(2.5), paddingVertical: hp(0.3)}}>
                                <Pressable onPress={() => router.push('/forgotPassword')} hitSlop={14}>
                                    <Text style={{fontSize: hp(1.8)}} className="font-bold text-right
                                    text-blue-500">
                                        Forgot password?
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* sign in button */}          
                    <View>
                        {
                            loading ? (
                                <View className="flex-row justify-center">
                                    <Loading size={hp(8)} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleLogin} 
                                style={{height: hp(6.46), width: wp(77.61), borderRadius: 30}} 
                                className='bg-blue-500 left-1/2 -translate-x-1/2 justify-center 
                                items-center border border-blue-600 shadow-sm'>
                                    <Text style={{fontSize: hp(2.7)}} className='text-white font-semibold
                                    tracking-wider'>
                                        Sign in
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                    {/* sign up text */}
                    <View className="flex-row justify-center gap-2">
                        <Text style={{fontSize: hp(1.8)}} className="text-black 
                        font-medium">
                            Don't have an account? 
                        </Text>
                        <Pressable onPress={() => router.push('/signUp')} hitSlop={14}>
                            <Text style={{fontSize: hp(1.8)}} className="font-bold 
                            text-blue-500">
                                Sign up
                            </Text>
                        </Pressable>
                    </View>

                    {/* divider */}
                    <View className="flex-row items-center">
                        <View className="flex-1 border-t border-gray-300" />
                        <Text className="mx-4 text-gray-600">OR</Text>
                        <View className="flex-1 border-t border-gray-300" />
                    </View>

                    {/* continue with Google button */}
                    <View>
                        {
                            googleLoading ? (
                                <View className="flex-row justify-center">
                                    <Loading size={hp(8)} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleGoogleLogin} 
                                style={{height: hp(6.46), width: wp(77.61), borderRadius: 30}} 
                                className='bg-white left-1/2 -translate-x-1/2 justify-center 
                                items-center border border-gray flex-row gap-5 shadow-sm'>
                                    <Image
                                        source={require('../assets/images/google-icon.png')}
                                        style={{width: wp(7.63), height: hp(3.52)}}
                                    />
                                    <Text style={{fontSize: hp(2)}} className='text-black font-semibold
                                    tracking-wider'>
                                        Sign in with Google
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    </SafeAreaView>
    </ImageBackground>
  )
}

export default Onboard
