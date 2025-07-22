import { View, Text, ImageBackground, Image, TextInput, TouchableOpacity, Pressable, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { StatusBar } from 'expo-status-bar'
import Loading from '../components/Loading.js'
import CustomKeyboardView from '../components/CustomKeyboardView.js'
import { pickOnePic } from '@/utils/imagePicker'
import AdjustPicModal from '@/components/AdjustPicModal';
import DisplayPicModal from '@/components/DisplayProfilePicModal.js';
import axios, { isAxiosError } from "axios";
import { useAuth } from '@/context/authContext.js';
import { Divider, Menu } from 'react-native-paper';
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from 'expo-router'

const Onboard = () => {
    const {user, setHasOnboarded, getUserIdToken, logout} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [picUri, setPicUri] = useState("");
    const [picWidth, setPicWidth] = useState(0);
    const [picHeight, setPicHeight] = useState(0);
    const [croppedPicUri, setCroppedPicUri] = useState("");
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [oldPicKey, setOldPicKey] = useState("");
    const [picKey, setPicKey] = useState("");
    const [updatePicSuccess, setUpdatePicSuccess] = useState(false);
    const [usernameErr, setUsernameErr] = useState("");
    const usernameRef = useRef("");
    const router = useRouter();

    // pick profile pic
    const pickProfilePic = async (source: "camera" | "gallery") => {
        setMenuOpen(false);
        try {
            const response = await pickOnePic(source);
            if (response.success) {
                setPicUri(response.uri);
                setCroppedPicUri(""); // reset croppedPicUri since the selected picture is changed
                setUploadSuccess(false); // similarly, reset uploadSuccess
                setUpdatePicSuccess(false); // similarly, reset updatePicSSuccess
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

    const uploadCroppedPic = async (token: string) => {
        try {
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
                throw new Error("Failed to retrieve upload link for AWS S3");
            }

            if (!croppedPicUri) {
                throw new Error("No profile picture was found");
            }

            // convert cropped pic uri into binary format to upload
            const resource = await fetch(croppedPicUri);
            const blob = await resource.blob();

            // upload to presigned uri
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "image/jpeg",
                },
                body: blob,
            });

            if (!response.ok) {
                throw new Error("Failed to upload user profile picture to AWS S3");
            }

            setUploadSuccess(true);
            const oldKey = picKey;
            if (oldKey) { // if there is a previous pic key, store the previous pic key into old pic key to be deleted later from AWS
                setOldPicKey(oldKey);
                setPicKey(key);
                return {key, oldKey};
            }

            setPicKey(key);
            return {key}; // for checking this time upload success or not 
        } catch (e) {
            if (isAxiosError(e)) { // deal with axios request errors 
                // if error comes from get presigned url, there will be a message field in res
                console.log(e.response?.data?.message || "Failed to get presigned url");
            } else { // deal with error in fetch and blob
                console.log(e);
            }
            Alert.alert("Onboard", "Failed to upload profile picture");
            return; // for checking this time upload success or not 
        }
    }

    const validateUsername = () => {
        if (/\s/.test(usernameRef.current)) {
            setUsernameErr("Username cannot contain space(s)");
            return {valid: false};
        }
        if (usernameRef.current.length < 3) {
            setUsernameErr("Username is too short");
            return {valid: false};
        }
        if (usernameRef.current.length > 20) {
            setUsernameErr("Username is too long");
            return {valid: false};
        }
        if (!/^[a-zA-Z0-9_]*$/.test(usernameRef.current)) {
            setUsernameErr("Username contains invalid character(s)");
            return {valid: false};
        }
        setUsernameErr(""); // clear username error if valid
        return {valid: true};
    }

    const updatePicToDb = async (token: string, key: string, oldKey?: string) => {
        try {
            if (!key) {
                throw new Error("Missing AWS S3 key for profile picture")
            }

            // update profile pic key to db if user upload profile pic
            const picRes = await axios.patch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/profile-pic`, 
                { profilePicKey: key },
                { 
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            if (!picRes?.data?.user) {
                throw new Error("Failed to update profile picture key to database");
            }

            if (oldKey) { // if there is old pic key, remove the object from aws
                await axios.delete(
                    `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/aws`, 
                    { 
                        data: { key: oldKey },
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                )
                setOldPicKey("") // after successful deletion, reset oldPicKey
            }
            setUpdatePicSuccess(true); // if reach here, means update pic key and delete old pic object are successful 
            return true; // for checking update pic to db success
        } catch (e) {
            console.log(e);
            Alert.alert("Onboard", "Failed to update profile picture");
            return false; // for checking update pic to db success
        }
    }

    const updateUsernameToDb = async (token: string) => {
        try {
            // update username to db 
            const usernameRes = await axios.patch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/username`, 
                { username: usernameRef.current },
                { 
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            if (!usernameRes?.data?.user) {
                throw new Error("Failed to update username to database");
            }
            return true; // for checking update username to db success
        } catch (e) {
            if (isAxiosError(e) && e?.response?.status === 400) { // handle backend bad request error separately
                const message = e.response?.data?.message;
                if (message && message !== "Missing uid") { // Missing uid is not an username error that need to be exposed to user side
                    setUsernameErr(e.response.data.message);
                    return;
                }
            }
            console.log(e);
            Alert.alert("Onboard", "Failed to update username");
            return false; // for checking update db success
        }
    }

    const handleSubmit = async () => {
        if (!usernameRef.current) {
            Alert.alert('Sign in', 'Please fill in username');
            return;
        }

        const validateRes = validateUsername(); // check username one more time in case user never on blur

        if (!validateRes.valid) {
            setLoading(false); // early exit if username is not valid
            return;
        }

        setLoading(true);
        const token = await getUserIdToken(user);
        
        if (croppedPicUri) { // if there is a user uploaded pic 
            if (!uploadSuccess) { // if the pic haven't uploaded to aws yet
                const uploadRes = await uploadCroppedPic(token);
                if(!uploadRes) {
                    setLoading(false);
                    return; // early exit if fail to upload profile picture
                }
                const updatePicRes = await updatePicToDb(token, uploadRes.key, uploadRes.oldKey);
                if (!updatePicRes) {
                    setLoading(false);
                    return; // early exit if fail to update new pic key to database
                }
            } 

            if (uploadSuccess && !updatePicSuccess) { // if haven't updated pic key to db successfully yet
                const updatePicRes = await updatePicToDb(token, picKey, oldPicKey);
                if (!updatePicRes) {
                    setLoading(false);
                    return; // early exit if fail to update new pic key to database
                }
            }
        }

        const updateUsernameRes = await updateUsernameToDb(token);
        if (!updateUsernameRes) {
            setLoading(false);
            return; // exit if fail to update username to database
        }

        setHasOnboarded(true) // if reach here, means everything is successful, onboard is thus complete now 
        setLoading(false);
    }

    const handleBackToSignIn = async () => {
        const logOutRes = await logout();
        if (!logOutRes.success) {
          Alert.alert("Back to Sign in failed", logOutRes.message);
        } else {
          router.replace("/signIn");
        }
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
            className="flex-1 gap-9 bg-transparent items-center">
                <View style={{top: hp(5.5), width: wp(75.8), height: hp(13.7)}}
                className="bg-transparent justify-center items-center">
                    <Image source={require("../assets/images/plane-pic.png")} className="absolute"
                    style={{width: wp(31.8), height: hp(14.7), left: wp(45), top: 0}}/>
                    <Text style={{fontSize: hp(2.8)}} className="font-medium text-center
                    text-black">
                        Your All-in-One App for Group Travelling
                    </Text> 
                </View> 

                <View style={{top: hp(5), width: wp(88), height: hp(65), paddingHorizontal: wp(2.5),
                paddingTop: hp(2.5), paddingBottom: hp(4), borderRadius: 30}}
                className="flex flex-col justify-center items-center gap-7 bg-white">

                    {/* display profile pic */}
                    <Pressable onPress={() => setDisplayModalOpen(true)}>
                        <Image source={croppedPicUri ? ({uri: croppedPicUri}) : 
                            require("../assets/images/default-user-profile-pic.png")}
                            style={{width: wp(35), height: wp(35), borderRadius: wp(35) / 2}}
                            className="border-neutral-400 border-2" />
                    </Pressable>

                    {/* choose a different profile pic text */}
                    <Menu visible={menuOpen} onDismiss={() => setMenuOpen(false)}
                    anchor={
                        <Pressable onPress={() => setMenuOpen(true)} hitSlop={14}>
                            <Text style={{fontSize: hp(1.8)}} className="font-bold text-blue-500">
                                Choose a different profile picture
                            </Text>
                        </Pressable>
                    }
                    contentStyle={{borderRadius: 10, backgroundColor: "white", elevation: 3}}>
                        <Menu.Item title="Take photo" onPress={() => pickProfilePic("camera")} />
                        <Divider />
                        <Menu.Item title="Choose from gallery" onPress={() => pickProfilePic("gallery")} />
                    </Menu>

                    {/* username input */}
                    <View className="gap-4">
                        <View style={{paddingHorizontal: wp(2.5)}} className="flex flex-row gap-2">
                            <Text style={{fontSize: hp(2.4)}} className="font-semibold text-black">
                                Username
                            </Text>
                            <Text style={{fontSize: hp(2.4)}} 
                            className="font-semibold text-red-500 text-left">
                                *
                            </Text>
                        </View>
                        <View className="gap-3 justify-center items-center">
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={{borderRadius: 5, width: wp(77.61), height: hp(6.46),
                                paddingHorizontal:wp(4), gap: wp(3.8), 
                                borderColor: usernameErr ? "red" : "black"}}
                                className="flex-row bg-white border justify-center items-center">
                                    <TextInput
                                        autoCapitalize="none"
                                        onChangeText={value=> usernameRef.current=value}
                                        style={{fontSize:hp(2)}}
                                        className="flex-1 font-medium text-black"
                                        placeholder="Enter a username"
                                        placeholderTextColor={"gray"}
                                    />
                                </View>
                            </TouchableWithoutFeedback>

                            {/* instruction message */}
                            <View style={{paddingHorizontal: wp(2.5)}}>
                                <Text style={{fontSize: hp(1.5)}} className="font-medium italic
                                text-gray-400">
                                    3–20 characters. Letters, numbers, and _ only. 
                                    No spaces or other special characters. 
                                </Text>
                            </View>

                            {/* error message */}
                            <View style={{paddingHorizontal: wp(2)}} className="h-5 w-full 
                            items-start">
                                {usernameErr && (
                                    <View className="flex-row gap-1.5 items-center">
                                        <Entypo name="cross" size={18} color="red" />
                                        <Text style={{fontSize: hp(1.5)}} className="font-medium 
                                        text-red-500">{usernameErr}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* finish setup button */}          
                    <View>
                        {
                            loading ? (
                                <View className="flex-row justify-center">
                                    <Loading size={hp(8)} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleSubmit} 
                                style={{height: hp(6.46), width: wp(60), borderRadius: 30}} 
                                className='bg-blue-500 justify-center items-center border 
                                border-blue-600 shadow-sm'>
                                    <Text style={{fontSize: hp(2.7)}} className='text-white font-semibold
                                    tracking-wider'>
                                        Finish setup
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                    {/* return to sign up page */}
                    <View className="items-center justify-center">
                        <Pressable onPress={handleBackToSignIn} style={{minWidth: 30, minHeight: 30}}>
                            <Text style={{fontSize: hp(1.5)}} className="font-bold text-gray-500">
                            Back to Sign in
                            </Text>
                        </Pressable>
                    </View>
            </View>
            </View>

            <DisplayPicModal isVisible={displayModalOpen} picUri={croppedPicUri} 
            closeModal={closeDisplayModal} />
            
            {picUri && picWidth > 0 && picHeight > 0 && (
                <AdjustPicModal isVisible={adjustModalOpen} picUri={picUri} width={picWidth}
                height={picHeight} closeModal={closeAdjustModal} completeCrop={completeAdjustPic} />
            )}
        </CustomKeyboardView>
    </SafeAreaView>
    </ImageBackground>
  )
}

export default Onboard
