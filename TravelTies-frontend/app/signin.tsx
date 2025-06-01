import { View, Text, ImageBackground, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import { StatusBar } from 'expo-status-bar'
import { Feather, Ionicons, Octicons } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import Loading from '../components/Loading.js'
import CustomKeyboardView from '../components/CustomKeyboardView.js'
import { useAuth } from '@/context/authContext.js'

const SignIn = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Sign in', 'Please fill in all the fields!');
            return;
        }

        setLoading(true);

        const response = await login(emailRef.current, passwordRef.current);
        setLoading(false);

        console.log('sign in response: ', response);
        if (!response.success) {
            Alert.alert('Sign in', response.message);
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
                <View style={{top: hp(7.04), width: wp(75.8), height: hp(13.7)}}
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

                <View style={{top: hp(5), width: wp(88), height: hp(58), paddingHorizontal: wp(2.5),
                paddingTop: hp(2.5), paddingBottom: hp(4), borderRadius: 30}}
                className='flex flex-col left-1/2 -translate-x-1/2 gap-6 bg-white'>
                    <Text style={{fontSize: hp(4.11)}} className='font-bold tracking-wider text-center'> 
                        Welcome back
                    </Text>   

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
                        <View className='gap-4'>
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
                            <View style={{paddingHorizontal: wp(2.5)}}>
                                <Text style={{fontSize: hp(1.8)}} className='font-semibold text-right
                                text-blue-500'>
                                    Forgot password?
                                </Text>
                            </View>
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
                                <TouchableOpacity onPress={handleLogin} 
                                style={{height: hp(6.46), width: wp(77.61), borderRadius: 30}} 
                                className='bg-blue-500 left-1/2 -translate-x-1/2 justify-center 
                                items-center border border-blue-600'>
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
                        <Pressable onPress={() => router.push('/signUp')}>
                            <Text style={{fontSize: hp(1.8)}} className="font-bold 
                            text-blue-500">
                                Sign up
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    </SafeAreaView>
    </ImageBackground>
  )
}

export default SignIn
