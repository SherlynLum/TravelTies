import { View, Text, ImageBackground, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import { StatusBar } from 'expo-status-bar'
import { Feather, Octicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Loading from '../components/Loading.js'
import CustomKeyboardView from '../components/CustomKeyboardView.js'
import { useAuth } from '@/context/authContext.js'

const SignUp = () => {
    const router = useRouter();
    const {register} = useAuth();
    const [loading, setLoading] = useState(false);
    const {googleSignIn} = useAuth();

    const emailRef = useRef("");
    const passwordRef = useRef("");
    const repeatPasswordRef = useRef("");

    const handleRegister = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Sign up', 'Please fill in all the fields!');
            return;
        }

        if (passwordRef.current !== repeatPasswordRef.current) {
            Alert.alert('Sign up', 'Passwords do not match!');
            return;
        }

        setLoading(true);

        let response = await register(emailRef.current, passwordRef.current)
        setLoading(false);

        console.log('got result: ', response);
        if (!response.success) {
            Alert.alert('Sign up', response.message);
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
        style='dark'
    />
    <SafeAreaView className='flex-1'>
        <CustomKeyboardView>
            <View style={{paddingHorizontal: wp(4.07), paddingTop: hp(1.88)}}
            className='flex-1 gap-12 bg-transparent'>
                <View style={{top: hp(5.5), width: wp(75.8), height: hp(13.7)}}
                className='absoulte left-1/2 -translate-x-1/2 bg-transparent 
                justify-center items-center'>
                    <Image
                        source={require('../assets/images/plane-pic.png')}
                        className="absolute"
                        style={{width: wp(31.8), height: hp(14.7), left: wp(45), top: 0}}
                    />
                    <Text style={{fontSize: hp(2.8)}} className='font-medium text-center
                    text-black'>
                        Your All-in-One App for Group Travelling
                    </Text> 
                </View> 

                <View style={{top: hp(5), width: wp(88), height: hp(61), paddingHorizontal: wp(2.5),
                paddingTop: hp(2.5), paddingBottom: hp(4), borderRadius: 30}}
                className='flex flex-col left-1/2 -translate-x-1/2 gap-5 bg-white'>
                    <View style={{paddingHorizontal: wp(3.8)}}>
                        <Text style={{fontSize: hp(4.11)}} className='font-bold tracking-wider'> 
                            Sign up
                        </Text>   
                    </View> 

                    {/* inputs */}
                    <View className='gap-5'>
                        <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46)}}
                        className='flex-row gap-4 px-4 left-1/2 -translate-x-1/2 bg-white 
                        border border-black items-center'>
                            <Octicons name='mail' size={hp(2.7)} color='black' />
                            <TextInput
                                onChangeText={value=> emailRef.current=value}
                                style={{fontSize:hp(2)}}
                                className='flex-1 font-medium black'
                                placeholder='Email address'
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46),
                        paddingHorizontal:wp(4), gap: wp(3.8)}}
                        className='flex-row left-1/2 -translate-x-1/2 bg-white 
                        border border-black items-center'>
                            <Octicons name='lock' size={hp(2.8)} color='black' />
                            <TextInput
                                onChangeText={value=> passwordRef.current=value}
                                style={{fontSize:hp(2)}}
                                className='flex-1 font-medium black'
                                placeholder='Password'
                                secureTextEntry
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46),
                        gap: wp(3.2)}} className='flex-row px-4 left-1/2 -translate-x-1/2 
                        bg-white border border-black items-center'>
                            <Feather name='repeat' size={hp(2.8)} color='black' />
                            <TextInput
                                onChangeText={value=> repeatPasswordRef.current=value}
                                style={{fontSize:hp(2)}}
                                className='flex-1 font-medium black'
                                placeholder='Repeat password'
                                secureTextEntry
                                placeholderTextColor={'gray'}
                            />
                        </View>
                    </View>

                    {/* submit button */}
                    
                    <View>
                        {
                            loading? (
                                <View className="flex-row justify-center">
                                    <Loading size={hp(8)} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleRegister} 
                                style={{height: hp(6.46), width: wp(77.61), borderRadius: 30}} 
                                className='bg-blue-500 left-1/2 -translate-x-1/2 justify-center 
                                items-center border border-blue-600'>
                                    <Text style={{fontSize: hp(2.7)}} className='text-white font-semibold
                                    tracking-wider'>
                                        Sign up
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                    {/* sign up text */}
                    <View className="flex-row justify-center gap-2">
                        <Text style={{fontSize: hp(1.8)}} className="text-black 
                        font-medium">
                            Already have an account?
                        </Text>
                        <Pressable onPress={() => router.push('/signIn')}>
                            <Text style={{fontSize: hp(1.8)}} className="font-bold 
                            text-blue-500">
                                Sign in
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
                        <TouchableOpacity onPress={googleSignIn} 
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

                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    </SafeAreaView>
    </ImageBackground>
  )
}

export default SignUp
