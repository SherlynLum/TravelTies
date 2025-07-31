import { View, Text, ScrollView, Pressable, Image, TouchableWithoutFeedback, TextInput, TouchableOpacity, Alert, Keyboard, Platform, KeyboardAvoidingView, Linking } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import Loading from '@/components/Loading';
import { useEffect, useState } from 'react';
import { Divider, Menu } from 'react-native-paper';
import { Entypo } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { createStripeAccountUrl, getProfilePicUploadUrl, getProfileWithUrl, getStripeAccount, unlinkStripeAccount, updateProfilePic, updateStripeAccountUrl, updateUsername } from '@/apis/userApi';
import { pickOnePic } from '@/utils/imagePicker';
import DisplayPicModal from '@/components/DisplayProfilePicModal';
import AdjustPicModal from '@/components/AdjustPicModal';
import { isAxiosError } from 'axios';
import { deleteObj } from '@/apis/awsApi';

const EditProfile = () => {
    const ios = Platform.OS === 'ios'
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const {user, getUserIdToken} = useAuth();
    const [username, setUsername] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [picUri, setPicUri] = useState("");
    const [picWidth, setPicWidth] = useState(0);
    const [picHeight, setPicHeight] = useState(0);
    const [croppedPicUri, setCroppedPicUri] = useState("");
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [oldPicKey, setOldPicKey] = useState("");
    const [picKey, setPicKey] = useState(""); 
    const [updatePicSuccess, setUpdatePicSuccess] = useState(false);
    const [usernameErr, setUsernameErr] = useState("");
    const [needCreateAccount, setNeedCreateAccount] = useState<boolean | null>(null);
    const [stripeHasOnboard, setStripeHasOnboard] = useState<boolean | null>(null);
    const [accountId, setAccountId] = useState("");
    const [stripeLoading, setStripeLoading] = useState(false);
    const router = useRouter();

    // get current user's profile 
    useEffect(() => {
        setLoading(true);

        const getUserProfile = async () => {
        try {
            const token = await getUserIdToken(user);
            const profile = await getProfileWithUrl(token);
            setUsername(profile.username);
            if (profile.profilePicUrl) {
                setProfilePicUrl(profile.profilePicUrl);
            }
            if (profile.profilePicKey) {
                setPicKey(profile.profilePicKey);
            }
            const account = await getStripeAccount(token);
            if (account?.hasStripeAccount === false) {
                setNeedCreateAccount(true);
                setStripeHasOnboard(false);
            } else if (account?.hasStripeAccount === true) {
                setNeedCreateAccount(false);
                if (account?.hasOnboard === false) {
                    setStripeHasOnboard(false);
                    setAccountId(account?.accountId || "");
                } else if (account?.hasOnboard === true) {
                    setStripeHasOnboard(true);
                    setAccountId(account?.accountId || "")
                }
            } 
        } catch (e) {
            console.log(e);
            Alert.alert("Profile", 
            "Unable to load profile details",
            [{
                text: "Back to Profile main screen",
                onPress: () => router.replace(`/profile`)
            }])
        } finally {
            setLoading(false);
        }
        }
        getUserProfile();
    }, [])

    // pick profile pic
    const pickProfilePic = async (source: "camera" | "gallery") => {
        setMenuOpen(false);
        try {
            const response = await pickOnePic(source);
            if (response.success) {
                setPicUri(response.uri);
                setCroppedPicUri(""); // reset croppedPicUri since the selected picture is changed
                setUploadSuccess(false); // similarly, reset uploadSuccess
                setUpdatePicSuccess(false); // similarly, reset updatePicSuccess
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
            const {key, url} = await getProfilePicUploadUrl(token);
            if (!key || !url) {
                throw new Error("Failed to retrieve upload link for AWS S3");
            }

            if (!croppedPicUri) {
                throw new Error("No newly selected profile picture was found");
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
            Alert.alert("Edit profile", "Failed to upload new profile picture");
            return; // for checking this time upload success or not 
        }
    }

    const validateUsername = () => {
        if (/\s/.test(username)) {
            setUsernameErr("Username cannot contain space(s)");
            return {valid: false};
        }
        if (username.length < 3) {
            setUsernameErr("Username is too short");
            return {valid: false};
        }
        if (username.length > 20) {
            setUsernameErr("Username is too long");
            return {valid: false};
        }
        if (!/^[a-zA-Z0-9_]*$/.test(username)) {
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
            const picRes = await updateProfilePic({token, key})
            if (!picRes) {
                throw new Error("Failed to update profile picture key to database");
            }

            if (oldKey) { // if there is old pic key, remove the object from aws
                await deleteObj(token, oldKey);
                setOldPicKey("") // after successful deletion, reset oldPicKey
            }
            setUpdatePicSuccess(true); // if reach here, means update pic key and delete old pic object are successful 
            return true; // for checking update pic to db success
        } catch (e) {
            console.log(e);
            Alert.alert("Edit profile", "Failed to update profile picture");
            return false; // for checking update pic to db success
        }
    }

    const updateUsernameToDb = async (token: string) => {
        try {
            // update username to db 
            const usernameRes = await updateUsername({token, username})
            if (!usernameRes) {
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
            Alert.alert("Edit profile", "Failed to update username");
            return false; // for checking update db success
        }
    }

    const handleUpdate = async () => {
        if (!username) {
            Alert.alert('Edit profile', 'Username cannot be empty');
            return;
        }

        const validateRes = validateUsername(); // check username one more time in case user never on blur

        if (!validateRes.valid) {
            return;
        }

        setUpdateLoading(true);
        const token = await getUserIdToken(user);
        
        if (croppedPicUri) { // if there is a newly uploaded user uploaded pic 
            if (!uploadSuccess) { // if the pic haven't uploaded to aws yet
                const uploadRes = await uploadCroppedPic(token);
                if (!uploadRes) {
                    setUpdateLoading(false);
                    return; // early exit if fail to upload profile picture
                }
                const updatePicRes = await updatePicToDb(token, uploadRes.key, uploadRes.oldKey);
                if (!updatePicRes) {
                    setUpdateLoading(false);
                    return; // early exit if fail to update new pic key to database
                }
            } 

            if (uploadSuccess && !updatePicSuccess) { // if haven't updated pic key to db successfully yet
                const updatePicRes = await updatePicToDb(token, picKey, oldPicKey);
                if (!updatePicRes) {
                    setUpdateLoading(false);
                    return; // early exit if fail to update new pic key to database
                }
            }
        }

        const updateUsernameRes = await updateUsernameToDb(token);
        if (!updateUsernameRes) {
            setUpdateLoading(false);
            return; // exit if fail to update username to database
        }

        setUpdateLoading(false);
    }

    const handleConnectWithStripe = async () => {
        try {
            const token = await getUserIdToken(user);
            const url = await createStripeAccountUrl({token, needCreateAccount, accountId});
            if (!url) {
                throw new Error("No url is returned for Stripe onboarding");
            }
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                throw new Error("Url for Stripe onboarding is invalid");
            }
        } catch (e) {
            console.log(e);
            if (isAxiosError(e)) {
                console.error('Axios error:', {
                    message: e.message,
                    status: e.response?.status,
                    data: e.response?.data,
                });
            }
            Alert.alert("Connect with Stripe", "Unable to connect with Stripe - please try again later");
        }
    }

    const handleOpenStripe = async () => {
        try {
            const token = await getUserIdToken(user);
            if (!accountId) {
                throw new Error("No Stripe account ID is found");
            }
            const url = await updateStripeAccountUrl({token, id: accountId});
            if (!url) {
                throw new Error("No url is returned for updating Stripe");
            }
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                throw new Error("Url for updating Stripe is invalid");
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Open Stripe", "Unable to open Stripe - please try again later");
        }
    }

    const handleUnlinkStripe = async () => {
        try {
            if (!accountId) {
                throw new Error("No Stripe account ID is found");
            }
            const token = await getUserIdToken(user);
            await unlinkStripeAccount({token, id: accountId});
        } catch (e) {
            console.log(e);
            Alert.alert("Unlink account", "Unable to unlink Stripe account - please try again later");
        }
    }

    const checkUpdatedStripe = async () => {
        setStripeLoading(true);
        try {
            const token = await getUserIdToken(user);
            const account = await getStripeAccount(token);
            if (account?.hasStripeAccount === false) {
                setNeedCreateAccount(true);
                setStripeHasOnboard(false);
            } else if (account?.hasStripeAccount === true) {
                setNeedCreateAccount(false);
                if (account?.hasOnboard === false) {
                    setStripeHasOnboard(false);
                    setAccountId(account?.accountId || "");
                } else if (account?.hasOnboard === true) {
                    setStripeHasOnboard(true);
                    setAccountId(account?.accountId || "")
                }
            } 
        } catch (e) {
            console.log(e);
            Alert.alert("Profile", "Unable to load Stripe account status - please try again later")
        } finally {
            setStripeLoading(false);
        }
    }

    return (
        <>
        <StatusBar 
            translucent
            backgroundColor="transparent"
            style="light"
        />
        {loading ? (
            <View className="flex-1 justify-center items-center px-5 bg-white">
                <Loading size={hp(12)} />
            </View>
        ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={ios? 'padding': 'height'} style={{flex: 1}}>
        <ScrollView className="flex-1 flex-col px-5 pt-6 bg-white" 
        contentContainerStyle={{paddingBottom: insets.bottom, alignItems: "center", 
            justifyContent:"center", rowGap: 60}} 
        keyboardShouldPersistTaps="handled">
            <View className="flex flex-col gap-4 justify-center items-center">
                {/* display profile pic */}
                <Pressable onPress={() => setDisplayModalOpen(true)}>
                    <Image source={croppedPicUri ? ({uri: croppedPicUri}) : 
                        profilePicUrl === "Failed to load" ? require("../../../assets/images/image-error-icon.png")
                        : profilePicUrl ? {uri: profilePicUrl} :
                        require("../../../assets/images/default-user-profile-pic.png")}
                        style={{width: 120, height: 120, borderRadius: 60}}
                        className="border-neutral-400 border-2" />
                </Pressable>

                {/* choose a different profile pic text */}
                <Menu visible={menuOpen} onDismiss={() => setMenuOpen(false)}
                anchor={
                    <Pressable onPress={() => setMenuOpen(true)} hitSlop={14}>
                        <Text className="font-bold text-blue-500 text-sm">
                            Choose a different profile picture
                        </Text>
                    </Pressable>
                }
                contentStyle={{borderRadius: 10, backgroundColor: "white", elevation: 3}}>
                    <Menu.Item title="Take photo" onPress={() => pickProfilePic("camera")}/>
                    <Divider />
                    <Menu.Item title="Choose from gallery" onPress={() => pickProfilePic("gallery")}/>
                </Menu>

                {/* username input */}
                <View className="gap-4">
                    <View 
                    className="flex flex-row gap-2 justify-start items-center w-full">
                        <Text className="font-semibold text-black text-left text-lg">
                            Username
                        </Text>
                        <Text 
                        className="font-semibold text-red-500 text-left text-lg">
                            *
                        </Text>
                    </View>
                    <View className="gap-3 justify-center items-center">
                        {/* username input */}
                        <View className={`flex items-start justify-center bg-white border 
                        px-4 rounded-[5px] h-[50px] w-full ${usernameErr ? "border-red-500" : "border-black"}`}>
                            <TextInput
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                                className="flex-1 font-medium text-black text-base"
                                placeholder="Enter a username"
                                placeholderTextColor={"gray"}
                                style={{textAlignVertical: "center"}}
                            />
                        </View>

                        {/* instruction message */}
                        <Text className="font-medium italic text-gray-400 text-xs">
                            3–20 characters. Letters, numbers, and _ only. 
                            No spaces or other special characters. 
                        </Text>

                        {/* error message */}
                        <View className="h-5 w-full items-start">
                            {usernameErr && (
                                <View className="flex-row gap-1.5 items-center">
                                    <Entypo name="cross" size={18} color="red" />
                                    <Text className="font-medium text-red-500 text-xs">
                                        {usernameErr}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* update profile button */}          
                <View>
                    {
                        updateLoading ? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(8)} />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleUpdate}
                            className='bg-blue-500 justify-center items-center border 
                            border-blue-600 shadow-sm h-[44px] px-8 rounded-[30px]'>
                                <Text className='text-white font-semibold tracking-wider text-sm'>
                                    Update profile
                                </Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>

            {/* link Stripe */}
            <View className="flex flex-col gap-7 w-full">
                <View className="flex items-start">
                    <Text className="font-semibold text-black text-left text-lg">
                        Payout account to receive payments
                    </Text>
                </View>
                {stripeLoading ? (
                    <View className="flex-row justify-center">
                        <Loading size={hp(8)} />
                    </View>
                ) : stripeHasOnboard ?
                (          
                    <View className="flex flex-row gap-2 items-center">
                        <Text className="text-neutral-500 italic font-medium text-xs">
                            Connected to Stripe
                        </Text>
                        <TouchableOpacity onPress={handleOpenStripe} 
                        className='justify-center items-center border shadow-sm h-[44px] px-4 rounded-[30px]'
                        style={{backgroundColor: "#635BFF", borderColor: "#4F4ACC"}}>
                            <Text className='text-white font-semibold tracking-wider text-sm'>
                                Open Stripe
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleUnlinkStripe} 
                        className='justify-center items-center border shadow-sm h-[44px] px-4 
                        rounded-[30px] bg-red-600 border-red-700'>
                            <Text className='text-white font-semibold tracking-wider text-sm'>
                                Unlink account
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex flex-col gap-5 items-center justify-center">
                        <TouchableOpacity onPress={handleConnectWithStripe} 
                        className='justify-center items-center border shadow-sm h-[44px] px-6 rounded-[30px]'
                        style={{backgroundColor: "#635BFF", borderColor: "#4F4ACC"}}>
                            <Text className='text-white font-semibold tracking-wider text-sm'>
                                Connect with Stripe
                            </Text>
                        </TouchableOpacity>
                        <Pressable onPress={checkUpdatedStripe} hitSlop={14}>
                            <Text className="font-bold text-blue-500 text-sm">
                                {"I've completed onboarding in Stripe"}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
            <DisplayPicModal isVisible={displayModalOpen} picUri={croppedPicUri || profilePicUrl} 
            closeModal={closeDisplayModal} />
            
            {picUri && picWidth > 0 && picHeight > 0 && (
                <AdjustPicModal isVisible={adjustModalOpen} picUri={picUri} width={picWidth}
                height={picHeight} closeModal={closeAdjustModal} completeCrop={completeAdjustPic} />
            )}
        </ScrollView>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        )}
        </>
    )
}

export default EditProfile